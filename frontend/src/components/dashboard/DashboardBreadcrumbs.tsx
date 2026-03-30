import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

type DashboardSection = "operations" | "directory" | "management";

const sectionMeta: Record<DashboardSection, { label: string; anchor: string }> = {
  operations: { label: "Operations", anchor: "operations" },
  directory: { label: "Directory", anchor: "directory" },
  management: { label: "Management", anchor: "management" },
};

interface DashboardBreadcrumbsProps {
  section: DashboardSection;
  current: string;
  className?: string;
}

export default function DashboardBreadcrumbs({
  section,
  current,
  className,
}: DashboardBreadcrumbsProps) {
  const meta = sectionMeta[section];

  return (
    <Breadcrumb className={cn("mb-2", className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard">Overview</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={`/dashboard#${meta.anchor}`}>{meta.label}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
