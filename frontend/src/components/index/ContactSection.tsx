import { ContactForm } from "@/components/ContactForm";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";

const MAP_CONSENT_KEY = "w4lkies-map-consent";

const ContactSection = () => {
  const [canLoadMap, setCanLoadMap] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedPreference = localStorage.getItem(MAP_CONSENT_KEY);
    setCanLoadMap(savedPreference === "accepted");
    setIsHydrated(true);
  }, []);

  const acceptMapConsent = () => {
    localStorage.setItem(MAP_CONSENT_KEY, "accepted");
    setCanLoadMap(true);
  };

  const resetMapConsent = () => {
    localStorage.removeItem(MAP_CONSENT_KEY);
    setCanLoadMap(false);
  };

  return (
    <section id="contact" className="bg-[hsl(var(--secondary)/0.2)] px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Get in Touch</p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Ready for happier walks in Chiswick?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Tell us about your dog and we&apos;ll recommend the best fit. Friendly replies, clear pricing,
            and no-pressure advice.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.7rem] border border-border/70 bg-card/95 p-6 shadow-[0_24px_40px_-30px_rgba(31,41,55,0.45)] sm:p-8">
            <ContactForm />
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card shadow-sm">
              {isHydrated && canLoadMap ? (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29959.723549100447!2d-0.26682515930183!3d51.485789880089875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x292ff8503b646f65%3A0x3a7dee181ebfd80d!2sw4lkies!5e0!3m2!1sen!2suk!4v1735388295574!5m2!1sen!2suk"
                  width="100%"
                  height="330"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="W4lkies location map"
                />
              ) : (
                <div className="flex min-h-[330px] flex-col items-center justify-center bg-[linear-gradient(145deg,rgba(255,154,54,0.12),rgba(147,191,176,0.2))] p-6 text-center">
                  <p className="text-base font-semibold text-foreground">Interactive map is optional</p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Loading Google Maps may set cookies or access your device information. Choose to
                    load it only if you want the embedded map.
                  </p>
                  <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={acceptMapConsent}
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Load Interactive Map
                    </button>
                    <a
                      href="https://maps.google.com/?q=Chiswick%20London%20W4"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center justify-center rounded-full border border-border/70 bg-background/90 px-5 py-2 text-sm font-semibold text-foreground transition hover:border-primary/35 hover:bg-primary/10"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-border/70 bg-card/95 p-6 shadow-sm">
              {isHydrated && canLoadMap && (
                <div className="rounded-xl border border-border/70 bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  Google Maps is enabled for this browser.
                  <button
                    type="button"
                    onClick={resetMapConsent}
                    className="ml-2 font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Disable map
                  </button>
                </div>
              )}
              <a
                href="mailto:hello@w4lkies.com"
                className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-sm text-foreground transition hover:border-primary/30 hover:bg-primary/10"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Mail className="h-5 w-5" />
                </span>
                hello@w4lkies.com
              </a>
              <a
                href="tel:+447534014933"
                className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-sm text-foreground transition hover:border-primary/30 hover:bg-primary/10"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Phone className="h-5 w-5" />
                </span>
                (+44) 7534 014933
              </a>
              <div className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-foreground">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                Chiswick, London W4
              </div>
              <a
                href="https://www.instagram.com/w4lkies"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-sm text-foreground transition hover:border-primary/30 hover:bg-primary/10"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Instagram className="h-5 w-5" />
                </span>
                @w4lkies
              </a>
              <a
                href="https://primal.net/p/nprofile1qqsyk2jgg2rafm3yzqtwz4pwl634hn9s6y4ulhhdvkfucrmxh9wuwlcz0hkmz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-sm text-foreground transition hover:border-primary/30 hover:bg-primary/10"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary text-base">
                  𓅦
                </span>
                npub1fv4y...mxaaf3
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
