import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} aria-hidden="true" />;
};

export default LoadingSpinner;
