import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardToolbarProps {
  left?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
  rightClassName?: string;
  actionContainerClassName?: string;
}

export default function DashboardToolbar({
  left,
  children,
  action,
  className,
  rightClassName,
  actionContainerClassName,
}: DashboardToolbarProps) {
  const hasRightContent = Boolean(action) || Children.count(children) > 0;

  return (
    <div className={cn("mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between", className)}>
      {left ? <div>{left}</div> : null}

      {hasRightContent ? (
        <div className={cn("flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto", rightClassName)}>
          {action ? (
            <div className={cn("order-first self-start sm:order-last sm:self-auto", actionContainerClassName)}>
              {action}
            </div>
          ) : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}
