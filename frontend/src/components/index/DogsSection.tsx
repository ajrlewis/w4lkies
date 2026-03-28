import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Quote, Star } from "lucide-react";

export const dogs = [
  {
    id: 1,
    name: "Hugo",
    breed: "Jack Russel",
    testimonial:
      "We are extremely lucky to have found Sophia - she is friendly, trustworthy, and really cares about our dog Hugo💕 Would highly recommend to anyone looking for a dog walker!",
    owner: "Helena I.",
    images: ["/img/dog-hugo-01.png", "/img/dog-hugo-02.png"],
  },
  {
    id: 2,
    name: "Rocky",
    breed: "Jack Russel",
    testimonial:
      "I can't say enough great things about Sophia and her excellent dog walking services. From the first time I met her, it was abundantly clear that Sophia is a true dog lover and has a natural rapport with furry friends of all breeds and sizes. What sets Sophia apart is her incredible passion, patience, and attentiveness when it comes to caring for dogs. She doesn't just walk them - she provides excellent exercise tailored to each dog's unique needs and energy levels.",
    owner: "Andrea W.",
    images: ["/img/dog-rocky-01.jpg"],
  },
  {
    id: 3,
    name: "Simon",
    breed: "Schnauzer",
    testimonial:
      "Sophia has been walking Simon, my miniature Schnauzer, for a couple months now and I am really happy with her. She is on time, reliable and very good with Simon. She clearly loves dogs and mine loves her a lot. He is always very happy to see her and comes back tired and having had a lovely adventure. I can't recommend W4lkies highly enough.",
    owner: "Cat S.-C.",
    images: ["/img/dog-simon-01.jpg"],
  },
  {
    id: 4,
    name: "Olly",
    breed: "Labrador ✕ Poodle",
    testimonial:
      "Sophia has been wonderful in looking after our dog Olly. He can be rather stubborn in nature and now slowing down with age, but Sophia has shown such great sincere attention, patience and care to Olly throughout. Always reliable and lovely daily updates too. 💯 recommend!",
    owner: "Will W.",
    images: ["/img/dog-olly-01.png"],
  },
  {
    id: 5,
    name: "Indy",
    breed: "Portuguese Water Dog",
    testimonial:
      "Sophia has been taking our dog Indy for walks for around a year and we would thoroughly recommend her. Indy is always so excited for her walks and comes back home very happy and very tired. Sophia made a real effort to get to know Indy so we felt very confident that she was in safe hands and was in no way phased by our bouncy young dog. She is always quick to respond, punctual and a delight to work with.",
    owner: "Posy D.",
    images: ["/img/dog-indy-01.png", "/img/dog-indy-02.png"],
  },
  {
    id: 6,
    name: "Billy",
    breed: "Flat Coat Retriever",
    testimonial:
      "Sophia is wonderful - we all feel so lucky to have her looking after our 'furry baby'. She is very organised but most importantly so conscientious of our dog's personality and needs - and he always looks forward to seeing her!",
    owner: "Amie F.",
    images: ["/img/dog-billy-01.png", "/img/dog-billy-02.png", "/img/dog-billy-03.png"],
  },
];

const DogsSection = () => (
  <section id="testimonials" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(149,188,172,0.2),transparent_35%),radial-gradient(circle_at_88%_24%,rgba(255,153,74,0.2),transparent_33%)]" />

    <div className="relative mx-auto max-w-6xl">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Testimonials</p>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Real stories from happy dogs and their humans
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Playful walks, calm handling and reliable updates that local owners can count on.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {dogs.map((dog) => (
          <Card
            key={dog.id}
            className="group h-full rounded-[1.6rem] border-border/70 bg-card/95 p-5 shadow-[0_22px_36px_-30px_rgba(31,41,55,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_28px_40px_-26px_rgba(31,41,55,0.5)]"
          >
            <div className="relative">
              {dog.images.length > 1 ? (
                <Carousel className="mx-auto w-full">
                  <CarouselContent>
                    {dog.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/70">
                          <img
                            src={image}
                            alt={`${dog.name} ${index + 1}`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-3 border-primary/20 bg-background/90 text-primary hover:bg-primary hover:text-primary-foreground" />
                  <CarouselNext className="right-3 border-primary/20 bg-background/90 text-primary hover:bg-primary hover:text-primary-foreground" />
                </Carousel>
              ) : (
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-border/70">
                  <img
                    src={dog.images[0]}
                    alt={dog.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              <div className="absolute -bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                Local Favourite
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-2xl font-semibold text-foreground">{dog.name}</h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">{dog.breed}</p>
            </div>

            <blockquote className="relative mt-4 rounded-2xl bg-muted/60 p-4 text-sm leading-relaxed text-foreground/90 sm:text-[0.95rem]">
              <Quote className="absolute left-3 top-3 h-4 w-4 text-primary/70" />
              <span className="block pl-6">{dog.testimonial}</span>
            </blockquote>

            <p className="mt-4 text-sm font-semibold text-foreground/80">{dog.owner}</p>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

export default DogsSection;
