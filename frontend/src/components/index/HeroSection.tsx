import Logo from "@/assets/logo";
import { Bike, MapPin, PawPrint, ShieldCheck } from "lucide-react";
import type { MouseEvent } from "react";

const trustPillClass =
  "inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/85 px-4 py-2 text-sm font-semibold text-foreground/80 shadow-sm";

const HeroSection = () => {
  const scrollToContact = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden px-4 pb-16 pt-12 sm:px-6 md:pb-20 md:pt-16"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_16%_12%,rgba(255,153,74,0.24),transparent_52%),radial-gradient(circle_at_82%_18%,rgba(150,188,172,0.22),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(to_bottom,transparent,rgba(255,247,236,0.85))]" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
        <div className="pt-4 md:pt-6">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold tracking-wide text-foreground">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <PawPrint className="h-4 w-4" />
            </span>
            Boutique Dog Walking in Chiswick
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.07] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Joyful local walks with premium care for every tail in W4
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Professional dog walking based in Chiswick, London. Friendly, dependable and fully
            insured, with thoughtful one-to-one care and leafy park adventures your dog will love.
          </p>

          <div className="mt-8 flex items-center">
            <a
              href="#contact"
              onClick={scrollToContact}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border/75 bg-background/80 px-7 py-3 text-base font-semibold text-foreground transition hover:border-primary/40 hover:bg-primary/10"
            >
              Get in Touch
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className={trustPillClass}>
              <ShieldCheck className="h-4 w-4 text-primary" />
              Fully insured
            </span>
            <span className={trustPillClass}>
              <MapPin className="h-4 w-4 text-primary" />
              Local to Chiswick
            </span>
            <span className={trustPillClass}>
              <Bike className="h-4 w-4 text-primary" />
              Bike-powered service
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-secondary/45 blur-2xl sm:h-28 sm:w-28" />
          <div className="absolute -bottom-4 -left-3 h-24 w-24 rounded-full bg-primary/30 blur-2xl sm:h-28 sm:w-28" />

          <div className="relative rounded-[2rem] border border-border/70 bg-card/90 p-3 shadow-[0_24px_48px_-30px_rgba(31,41,55,0.45)] sm:p-4">
            <div className="overflow-hidden rounded-[1.5rem]">
              <img
                src="/img/dog-stormi-01.jpg"
                alt="Happy dog ready for a Chiswick walk"
                className="h-[360px] w-full object-cover object-center sm:h-[430px]"
              />
            </div>

            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/60 bg-white/85 px-3 py-1.5 shadow-sm backdrop-blur sm:left-5 sm:top-5">
              <div className="h-8 w-8">
                <Logo />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/80">W4lkies</p>
            </div>

            <div className="absolute -bottom-5 right-4 rounded-2xl border border-border/60 bg-background/95 px-4 py-3 shadow-lg sm:right-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Trusted by local owners
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">Calm, kind and reliable daily care</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
