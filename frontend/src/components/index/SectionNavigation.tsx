import { ArrowDown, PawPrint } from "lucide-react";

interface SectionNavigationProps {
  targetId: string;
  label: string;
}

const SectionNavigation = ({ targetId, label }: SectionNavigationProps) => (
  <div className="px-4 py-8 sm:px-6">
    <div className="mx-auto flex max-w-6xl items-center justify-center">
      <a
        href={`#${targetId}`}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className="group inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/85 px-4 py-2 text-sm font-semibold text-foreground/80 shadow-sm transition hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
        aria-label={`Go to ${label}`}
      >
        <span className="hidden text-xs uppercase tracking-[0.14em] text-muted-foreground sm:inline">
          Next
        </span>
        <PawPrint className="h-4 w-4 text-primary" />
        <span>{label}</span>
        <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
      </a>
    </div>
  </div>
);

export default SectionNavigation;
