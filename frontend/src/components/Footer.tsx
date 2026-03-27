import { Link, useLocation } from "react-router-dom";
import { Instagram, Mail, Phone, PawPrint } from "lucide-react";
import type { MouseEvent } from "react";

const Footer = () => {
  const location = useLocation();

  const handleSmoothScroll = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();

    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-border/70 bg-background px-4 pb-10 pt-14 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_20%_0%,rgba(255,150,70,0.16),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/70 bg-[hsl(var(--secondary)/0.16)] px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <PawPrint className="h-4 w-4 text-primary" />
            Happy tails across Chiswick, London W4
          </p>
          <a
            href="mailto:hello@w4lkies.com"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            <Mail className="h-4 w-4" />
            hello@w4lkies.com
          </a>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                {location.pathname === "/" ? (
                  <a
                    href="#hero"
                    onClick={(e) => handleSmoothScroll(e, "hero")}
                    className="text-sm text-foreground/80 transition hover:text-primary"
                  >
                    Home
                  </a>
                ) : (
                  <Link to="/" className="text-sm text-foreground/80 transition hover:text-primary">
                    Home
                  </Link>
                )}
              </li>
              <li>
                {location.pathname === "/" ? (
                  <a
                    href="#services"
                    onClick={(e) => handleSmoothScroll(e, "services")}
                    className="text-sm text-foreground/80 transition hover:text-primary"
                  >
                    Services
                  </a>
                ) : (
                  <Link to="/#services" className="text-sm text-foreground/80 transition hover:text-primary">
                    Services
                  </Link>
                )}
              </li>
              <li>
                {location.pathname === "/" ? (
                  <a
                    href="#contact"
                    onClick={(e) => handleSmoothScroll(e, "contact")}
                    className="text-sm text-foreground/80 transition hover:text-primary"
                  >
                    Contact
                  </a>
                ) : (
                  <Link to="/#contact" className="text-sm text-foreground/80 transition hover:text-primary">
                    Contact
                  </Link>
                )}
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">Information</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/legal" className="text-sm text-foreground/80 transition hover:text-primary">
                  Legal Information
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="text-sm text-foreground/80 transition hover:text-primary">
                  Site Map
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                hello@w4lkies.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                (+44) 7534 014933
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-primary" />
                <a
                  href="https://www.instagram.com/w4lkies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-primary"
                >
                  @w4lkies
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/70 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} London W4lkies Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
