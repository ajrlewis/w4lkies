
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./legacy-pages/Index";
import NotFound from "./legacy-pages/NotFound";
import SignUp from "./legacy-pages/SignUp";
import SignIn from "./legacy-pages/SignIn";
import Legal from "./legacy-pages/Legal";
import Sitemap from "./legacy-pages/Sitemap";
import Dashboard from "./legacy-pages/Dashboard";
import Users from "./legacy-pages/Users";
import Bookings from "./legacy-pages/Bookings";
import Vets from "./legacy-pages/Vets";
import Customers from "./legacy-pages/Customers";
import Dogs from "./legacy-pages/Dogs";
import Services from "./legacy-pages/Services";
import Invoices from "./legacy-pages/Invoices";
import Expenses from "./legacy-pages/Expenses";
import PayUs from "./legacy-pages/PayUs"; 
import PaymentSuccess from "./legacy-pages/PaymentSuccess";
import Account from "./legacy-pages/Account";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/sitemap" element={<Sitemap />} />
            <Route path="/pay" element={<PayUs />} />
            <Route path="/payment-success" element={<PaymentSuccess />} /> 
            
            {/* Dashboard route */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Dashboard model routes */}
            <Route path="/dashboard/bookings" element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/users" element={
              <ProtectedRoute requireAdmin>
                <Users />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/vets" element={
              <ProtectedRoute requireAdmin>
                <Vets />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/customers" element={
              <ProtectedRoute requireAdmin>
                <Customers />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/dogs" element={
              <ProtectedRoute requireAdmin>
                <Dogs />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/services" element={
              <ProtectedRoute requireAdmin>
                <Services />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/invoices" element={
              <ProtectedRoute requireAdmin>
                <Invoices />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/expenses" element={
              <ProtectedRoute requireAdmin>
                <Expenses />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard/:model" element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } />
            
            {/* Redirect /bookings to /dashboard/bookings for backward compatibility */}
            <Route path="/bookings" element={
              <ProtectedRoute>
                <Navigate to="/dashboard/bookings" replace />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
