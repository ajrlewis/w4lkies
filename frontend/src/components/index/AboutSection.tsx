import { Bike, HeartHandshake, ShieldCheck, Trees } from "lucide-react";

const highlights = [
  {
    icon: Bike,
    title: "Bike-first walks",
    description: "We cycle to local routes, reducing travel stress and maximising outdoor walking time.",
  },
  {
    icon: ShieldCheck,
    title: "Fully insured",
    description: "Professional, reliable, and covered for total peace of mind.",
  },
  {
    icon: HeartHandshake,
    title: "Individual attention",
    description: "Every dog is handled with patience, warmth and care tailored to their personality.",
  },
  {
    icon: Trees,
    title: "Leafy local knowledge",
    description: "Experienced in Chiswick's parks and dog-friendly walking routes throughout W4.",
  },
];

const AboutSection = () => (
  <section id="about" className="relative bg-[hsl(var(--secondary)/0.2)] px-4 py-20 sm:px-6">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.8),transparent)]" />

    <div className="relative mx-auto max-w-6xl">
      <div className="mb-10 max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">About W4lkies</p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Professional care with the warmth of a trusted local neighbour
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-10">
        <div className="rounded-[1.7rem] border border-border/70 bg-card/90 p-6 shadow-[0_20px_40px_-30px_rgba(25,30,38,0.4)] sm:p-8">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              I&apos;m Sophia, the owner of W4lkies, Chiswick&apos;s premier independent dog care and
              walking service.
            </p>
            <p>
              With a team that shares an unmatched love and extensive experience with dogs, W4lkies
              ensures your pup enjoys a safe and delightful outing.
            </p>
            <p>
              Being local, we cycle to our walks, which is not only sustainable but also better for
              the dogs. By cycling, we maximize walking time and reduce stress for the dogs as they
              don&apos;t need to be in a van or car, ensuring a more enjoyable and relaxed experience for
              your pup.
            </p>
            <p>
              Fully insured for your peace of mind, W4lkies is your trusted partner for top-notch dog
              care in London.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {highlights.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
            >
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
