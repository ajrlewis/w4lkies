import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ManagementCardProps {
  title: string;
  subtitle?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const ManagementCard = ({
  title,
  subtitle,
  badges,
  actions,
  footer,
  children,
  className,
}: ManagementCardProps) => {
  return (
    <Card
      className={cn(
        "rounded-xl border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-lg font-semibold text-foreground">{title}</h2>
          {subtitle ? <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div> : null}
        </div>
        <div className="ml-2 flex shrink-0 flex-wrap items-center justify-end gap-2">
          {badges}
          {actions}
        </div>
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </Card>
  );
};

export default ManagementCard;
