import { Card } from "@/components/ui/card";
import { Heart, ShieldCheck } from "lucide-react";

const teamMembers = [
  {
    name: "Sophia",
    role: "Founder & Lead Dog Walker",
    image: "/img/team-sophia.jpg",
    bio: "As the founder of W4lkies, a premier dog walking business in London W4, I bring a wealth of experience in the pet care industry. With a successful track record of establishing a dog walking business in Edinburgh, Scotland, I have honed my skills in providing top-notch care for furry companions. Prior to founding W4lkies, I worked as a receptionist at a veterinary clinic in Shepherd's Bush, London, where I gained valuable insights into animal care and welfare. Combining my passion for dogs with my professional expertise, I am dedicated to ensuring the well-being and happiness of every canine client. W4lkies is committed to providing reliable and loving dog walking services in the vibrant community of London W4. Let us take your four-legged friend on a safe and enjoyable adventure while you're away. Your pet's happiness is our top priority!",
  },
  {
    name: "Sara",
    role: "Senior Dog Walker",
    image: "/img/team-sara.jpg",
    bio: "Growing up on a farm in Poland surrounded by various animals, I have always had a deep connection with pets. From chickens, pigs, horses, and cows to cats and dogs, caring for animals has been a passion of mine since childhood. After moving to Italy as a teenager, I rescued an abandoned dog and welcomed many cats into our countryside home. Now based in London for the past 10 years, I have transitioned from a career in hospitality to pursue my love for dogs. As a dedicated animal lover, I am excited to devote my time and affection to our canine companions. In my free time, I enjoy traveling, exploring new places, and taking long walks in nature.",
  },
];

const TeamSection = () => (
  <section id="team" className="bg-[hsl(var(--secondary)/0.18)] px-4 py-20 sm:px-6">
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Our Team</p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Meet the people behind every happy, muddy paw print
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {teamMembers.map((member) => (
          <Card
            key={member.name}
            className="h-full rounded-[1.7rem] border-border/70 bg-card/95 p-7 shadow-[0_22px_38px_-30px_rgba(31,41,55,0.42)]"
          >
            <div className="mb-6 flex items-center gap-5">
              <div className="relative h-24 w-24 overflow-hidden rounded-[1.6rem] border border-primary/25 bg-background shadow-sm">
                <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground">{member.name}</h3>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {member.role}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{member.bio}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground/80">
                <Heart className="h-3.5 w-3.5 text-primary" />
                Dog-first approach
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-foreground/80">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Trusted local care
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default TeamSection;
