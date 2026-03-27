import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { fetchPublicActiveServices } from "@/api/serviceRequests";
import type { Service } from "@/types/interfaces";
import {
  Dog,
  Handshake,
  Home,
  PawPrint,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pickServiceIcon = (service: Service): LucideIcon => {
  const text = `${service.name} ${service.description}`.toLowerCase();

  if (text.includes("meet") || text.includes("greet") || text.includes("consult")) {
    return Handshake;
  }
  if (text.includes("friend") || text.includes("group") || text.includes("pair")) {
    return UserPlus;
  }
  if (text.includes("visit") || text.includes("home") || text.includes("check-in")) {
    return Home;
  }
  if (text.includes("puppy") || text.includes("dog")) {
    return Dog;
  }
  if (text.includes("premium") || text.includes("bespoke") || text.includes("custom")) {
    return Sparkles;
  }
  if (text.includes("safe") || text.includes("insured") || text.includes("reliable")) {
    return ShieldCheck;
  }
  return PawPrint;
};

const formatPrice = (price: number | null) => {
  if (price === null || Number.isNaN(price)) {
    return "Bespoke pricing";
  }
  return currencyFormatter.format(price);
};

const ServicesSection = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["services", "homepage", "active-public"],
    queryFn: fetchPublicActiveServices,
    staleTime: 5 * 60 * 1000,
  });

  const services = useMemo(
    () => (data ?? []).filter((service) => service.is_active && service.is_publicly_offered),
    [data]
  );

  return (
    <section id="services" className="relative overflow-hidden bg-background px-4 py-20 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-8 h-28 bg-[radial-gradient(circle_at_center,rgba(255,157,77,0.2),transparent_72%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Our Services</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Premium walking and care options tailored to your dog
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Live availability from our current service list, showing only active and publicly offered
            options.
          </p>
        </div>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <Card
                key={item}
                className="h-full overflow-hidden rounded-[1.5rem] border-border/70 bg-card/90"
              >
                <CardContent className="p-6 sm:p-7">
                  <div className="mb-5 h-14 w-14 animate-pulse rounded-2xl bg-muted" />
                  <div className="mb-4 h-7 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="mb-3 h-5 w-28 animate-pulse rounded bg-muted" />
                  <div className="h-20 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <Card className="rounded-[1.5rem] border-border/70 bg-card/90">
            <CardContent className="p-7 text-center">
              <h3 className="text-xl font-semibold text-foreground">Services are loading right now</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Please refresh in a moment, or contact us directly and we&apos;ll help you choose the
                right walk.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && services.length === 0 && (
          <Card className="rounded-[1.5rem] border-border/70 bg-card/90">
            <CardContent className="p-7 text-center">
              <h3 className="text-xl font-semibold text-foreground">No public services available</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Our public service list is being updated. Please contact us for current options.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && services.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => {
              const ServiceIcon = pickServiceIcon(service);

              return (
                <Card
                  key={service.service_id}
                  className="group h-full overflow-hidden rounded-[1.5rem] border-border/70 bg-card/90 shadow-[0_20px_35px_-30px_rgba(31,41,55,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_26px_44px_-28px_rgba(31,41,55,0.48)]"
                >
                  <CardContent className="flex h-full flex-col p-6 sm:p-7">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                        <ServiceIcon className="h-7 w-7" />
                      </span>

                      <div className="flex flex-col items-end gap-2">
                        <p className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                          {formatPrice(service.price)}
                        </p>
                        {service.duration ? (
                          <p className="rounded-full border border-secondary/35 bg-secondary/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-foreground/80">
                            {service.duration} mins
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <h3 className="text-2xl font-semibold leading-tight text-foreground">{service.name}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
