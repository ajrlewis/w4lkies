
import { toast } from "@/components/ui/sonner";

const rawApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export const buildApiUrl = (endpoint: string): string => {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

// Helper to get token from localStorage
const getToken = () => localStorage.getItem("token");

// Generic API request function
export const apiRequest = async <T>(
  endpoint: string,
  method: string = "GET",
  data?: any
): Promise<T> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(buildApiUrl(endpoint), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      // Handle unauthorized errors
      if (response.status === 401) {
        console.log("Unauthorized access detected, redirecting to login page");
        localStorage.removeItem("token");
        
        // Use window.location for immediate redirect
        window.location.href = "/signin";
        toast.error("Authentication expired. Please sign in again.");
        throw new Error("Authentication expired. Please sign in again.");
      }
      
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }
    
    // Check if response is empty
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    
    return {} as T;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Don't display toast for auth errors as we already handle them above
    if (!(error instanceof Error && error.message.includes("Authentication expired"))) {
      toast.error((error as Error).message || "An error occurred while connecting to the server");
    }
    
    throw error;
  }
};

// API request function that returns both data and response for header access
export const apiRequestWithResponse = async <T>(
  endpoint: string,
  method: string = "GET",
  data?: any
): Promise<{ data: T; response: Response }> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(buildApiUrl(endpoint), {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      // Handle unauthorized errors
      if (response.status === 401) {
        console.log("Unauthorized access detected, redirecting to login page");
        localStorage.removeItem("token");
        
        // Use window.location for immediate redirect
        window.location.href = "/signin";
        toast.error("Authentication expired. Please sign in again.");
        throw new Error("Authentication expired. Please sign in again.");
      }
      
      const errorText = await response.text();
      throw new Error(errorText || `Request failed with status ${response.status}`);
    }
    
    // Check if response is empty
    const contentType = response.headers.get("content-type");
    let responseData: T;
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = {} as T;
    }
    
    return { data: responseData, response };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Don't display toast for auth errors as we already handle them above
    if (!(error instanceof Error && error.message.includes("Authentication expired"))) {
      toast.error((error as Error).message || "An error occurred while connecting to the server");
    }
    
    throw error;
  }
};

// Model specific services
export const fetchAll = <T>(model: string): Promise<T[]> => {
  return apiRequest<T[]>(`/${model}`);
};

export const fetchById = <T>(model: string, id: string): Promise<T> => {
  return apiRequest<T>(`/${model}/${id}`);
};

export const create = <T>(model: string, data: any): Promise<T> => {
  return apiRequest<T>(`/${model}`, "POST", data);
};

export const update = <T>(model: string, id: string, data: any): Promise<T> => {
  return apiRequest<T>(`/${model}/${id}`, "PUT", data);
};

export const remove = (model: string, id: string): Promise<void> => {
  return apiRequest<void>(`/${model}/${id}`, "DELETE");
};
