import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { API_BASE_URL, apiRequest } from "@/api/apiService";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  isAdmin: boolean; // Add the isAdmin property
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));
  const [isAdmin, setIsAdmin] = useState<boolean>(localStorage.getItem("isAdmin") === "true");
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("isAdmin");
      setIsAuthenticated(false);
    }
  }, [token]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "password",
          username: username,
          password: password,
        }).toString(),
      });

      console.log("response = ", response);
      const data = await response.json();
      console.log("data = ", data);
      
      // Check if login was successful
      if (response.ok && data.access_token && data.token_type) {
        setToken(data.access_token);
        setUsername(username);
        localStorage.setItem("username", username);
        
        // Set admin status based on scopes returned from the API
        const isUserAdmin = data.scopes && Array.isArray(data.scopes) && data.scopes.includes("admin");
        setIsAdmin(isUserAdmin);
        localStorage.setItem("isAdmin", isUserAdmin.toString());
        
        toast.success("Successfully signed in");
        // Wait for state update to complete before navigating
        setTimeout(() => {
          navigate("/dashboard");
        }, 100);
        return true;
      }
      
      // Login failed - don't show toast here, let the component handle the error
      return false;
    } catch (error) {
      console.error("Login error:", error);
      // Don't show toast here either, let the component handle it
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setIsAdmin(false);
    navigate("/");
    toast.info("You have been signed out");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, username, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
