import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm">
        <h1 className="mb-3 text-5xl font-semibold tracking-tight text-foreground">404</h1>
        <p className="mb-5 text-base text-muted-foreground sm:text-lg">Oops! Page not found.</p>
        <Link to="/" className="text-sm font-semibold text-accent underline-offset-2 hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
