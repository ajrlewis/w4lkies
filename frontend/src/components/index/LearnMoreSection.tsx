import { ArrowDown, PawPrint } from "lucide-react";

const LearnMoreSection = () => (
  <section className="px-4 pb-6 pt-4 sm:px-6">
    <div className="mx-auto flex max-w-6xl justify-center">
      <a
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        className="group inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-foreground/75 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
      >
        <PawPrint className="h-4 w-4 text-primary" />
        Learn More
        <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
      </a>
    </div>
  </section>
);

export default LearnMoreSection;
