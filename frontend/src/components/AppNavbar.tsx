import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "@/assets/logo";
import {
  Sun,
  Moon,
  Dog,
  LogIn,
  LogOut,
  Users,
  User,
  Calendar,
  FileText,
  CreditCard,
  Home,
  LayoutDashboard,
  Info,
  SlidersHorizontal,
  Mail,
  Menu,
  X,
  PawPrint,
  KeyRound,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const homeLinks = [
  { to: "#about", label: "About", icon: <Info size={16} /> },
  { to: "#services", label: "Services", icon: <SlidersHorizontal size={16} /> },
  { to: "#team", label: "Team", icon: <Users size={16} /> },
  { to: "#happy-dogs", label: "Happy Dogs", icon: <Dog size={16} /> },
  { to: "#contact", label: "Contact", icon: <Mail size={16} /> },
];

const dashboardLinks = [
  { to: "/dashboard", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { to: "/dashboard/users", label: "Users", icon: <User size={16} /> },
  { to: "/dashboard/customers", label: "Customers", icon: <User size={16} /> },
  { to: "/dashboard/vets", label: "Vets", icon: <Users size={16} /> },
  { to: "/dashboard/dogs", label: "Dogs", icon: <Dog size={16} /> },
  { to: "/dashboard/services", label: "Services", icon: <SlidersHorizontal size={16} /> },
  { to: "/dashboard/bookings", label: "Bookings", icon: <Calendar size={16} /> },
  { to: "/dashboard/invoices", label: "Invoices", icon: <FileText size={16} /> },
  { to: "/dashboard/expenses", label: "Expenses", icon: <CreditCard size={16} /> },
  { to: "/dashboard/account", label: "Account", icon: <KeyRound size={16} /> },
];
const dashboardLinkGroups = [
  {
    title: "Operations",
    links: ["/dashboard/bookings", "/dashboard/invoices", "/dashboard/expenses"],
  },
  {
    title: "Directory",
    links: ["/dashboard/customers", "/dashboard/dogs", "/dashboard/vets", "/dashboard/services"],
  },
  {
    title: "Management",
    links: ["/dashboard/users", "/dashboard/account"],
  },
] as const;

const shellClass =
  "rounded-[1.35rem] border border-white/60 bg-[hsl(var(--background)/0.84)] shadow-[0_16px_40px_-28px_rgba(20,32,48,0.55)] backdrop-blur-xl transition-all duration-300";

const homeLinkClass =
  "group relative px-1 py-2 text-[0.95rem] font-semibold text-foreground/75 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openDashboardGroup, setOpenDashboardGroup] = useState<string | null>(null);
  const [activeHomeSection, setActiveHomeSection] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const isDashboardPage = useMemo(
    () => isAuthenticated && location.pathname.startsWith("/dashboard"),
    [isAuthenticated, location.pathname]
  );
  const isHomePage = location.pathname === "/";
  const isDashboardLinkActive = (to: string) =>
    to === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(to);
  const isHomeLinkActive = (id: string) => isHomePage && activeHomeSection === id;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDarkMode(shouldDark);

    if (shouldDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
    setOpenDashboardGroup(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!isHomePage || isDashboardPage) {
      setActiveHomeSection(null);
      return;
    }

    const sectionIds = homeLinks.map((link) => link.to.replace("#", ""));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sections.length === 0) {
      setActiveHomeSection(null);
      return;
    }

    let ticking = false;
    const updateActiveSection = () => {
      const marker = window.scrollY + 220;
      let currentSectionId: string | null = null;
      sections.forEach((section) => {
        if (section.offsetTop <= marker) {
          currentSectionId = section.id;
        }
      });
      setActiveHomeSection(currentSectionId);
      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActiveSection);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isHomePage, isDashboardPage]);

  const toggleDarkMode = () => {
    const dark = !isDarkMode;
    setIsDarkMode(dark);

    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveHomeSection(id);
    const scrollToSection = (sectionId: string, attempt = 0) => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (attempt < 25) {
        window.setTimeout(() => scrollToSection(sectionId, attempt + 1), 60);
      }
    };

    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(() => scrollToSection(id), 120);
    } else {
      scrollToSection(id);
    }

    setShowMobileMenu(false);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 120);
    }

    setShowMobileMenu(false);
  };

  const getDashboardLink = (to: string) => dashboardLinks.find((link) => link.to === to);

  const renderDesktopLinks = () => {
    if (isDashboardPage) {
      if (!isAdmin) {
        const userLinks = [
          { to: "/dashboard/bookings", label: "Bookings" },
          { to: "/dashboard/account", label: "Account" },
        ];
        return (
          <div className="flex items-center gap-5">
            <Link
              to="/dashboard"
              className={`${homeLinkClass} ${isDashboardLinkActive("/dashboard") ? "text-foreground" : ""}`}
            >
              Overview
              <span
                className={`absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full bg-primary transition-transform duration-300 ${
                  isDashboardLinkActive("/dashboard") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </Link>
            {userLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`${homeLinkClass} ${isDashboardLinkActive(link.to) ? "text-foreground" : ""}`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full bg-primary transition-transform duration-300 ${
                    isDashboardLinkActive(link.to) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}
          </div>
        );
      }

      return (
        <div className="flex items-center gap-5">
          <Link
            to="/dashboard"
            className={`${homeLinkClass} ${isDashboardLinkActive("/dashboard") ? "text-foreground" : ""}`}
          >
            Overview
            <span
              className={`absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full bg-primary transition-transform duration-300 ${
                isDashboardLinkActive("/dashboard") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>

          {dashboardLinkGroups.map((group) => {
            const isGroupActive = group.links.some((to) => isDashboardLinkActive(to));
            const isGroupOpen = openDashboardGroup === group.title;

            return (
              <div
                key={group.title}
                onMouseEnter={() => setOpenDashboardGroup(group.title)}
              >
                <DropdownMenu
                  open={isGroupOpen}
                  onOpenChange={(open) =>
                    setOpenDashboardGroup((current) =>
                      open ? group.title : current === group.title ? null : current
                    )
                  }
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`${homeLinkClass} inline-flex items-center gap-1 ${
                        isGroupActive || isGroupOpen ? "text-foreground" : ""
                      }`}
                    >
                      <span>{group.title}</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          isGroupOpen ? "rotate-180" : ""
                        }`}
                      />
                      <span
                        className={`absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full bg-primary transition-transform duration-300 ${
                          isGroupActive || isGroupOpen ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="w-56"
                    onMouseEnter={() => setOpenDashboardGroup(group.title)}
                    onMouseLeave={() => setOpenDashboardGroup((current) => (current === group.title ? null : current))}
                  >
                    {group.links.map((to) => {
                      const link = getDashboardLink(to);
                      if (!link) {
                        return null;
                      }

                      return (
                        <DropdownMenuItem
                          key={link.to}
                          asChild
                          className={isDashboardLinkActive(link.to) ? "bg-accent text-accent-foreground" : undefined}
                        >
                          <Link to={link.to} className="flex items-center gap-2">
                            {link.icon}
                            <span>{link.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      );
    }

    return homeLinks.map((link) => {
      const sectionId = link.to.replace("#", "");
      const isActive = isHomeLinkActive(sectionId);
      return (
        <a
          key={link.label}
          href={link.to}
          onClick={(e) => handleSmoothScroll(e, sectionId)}
          className={`${homeLinkClass} ${isActive ? "text-foreground" : ""}`}
        >
          {link.label}
          <span
            className={`absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full bg-primary transition-transform duration-300 ${
              isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </a>
      );
    });
  };

  const renderMobileLinks = () => {
    if (isDashboardPage) {
      if (!isAdmin) {
        const userLinks = [
          { to: "/dashboard/bookings", label: "Bookings", icon: <Calendar size={16} /> },
          { to: "/dashboard/account", label: "Account", icon: <KeyRound size={16} /> },
        ];
        return (
          <div className="space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-base font-medium transition ${
                isDashboardLinkActive("/dashboard")
                  ? "border-primary/35 bg-primary/12 text-foreground"
                  : "border-transparent text-foreground/90 hover:border-primary/25 hover:bg-primary/10"
              }`}
              onClick={() => setShowMobileMenu(false)}
            >
              <LayoutDashboard size={16} />
              <span>Overview</span>
            </Link>
            {userLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-base font-medium transition ${
                  isDashboardLinkActive(link.to)
                    ? "border-primary/35 bg-primary/12 text-foreground"
                    : "border-transparent text-foreground/90 hover:border-primary/25 hover:bg-primary/10"
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-base font-medium transition ${
              isDashboardLinkActive("/dashboard")
                ? "border-primary/35 bg-primary/12 text-foreground"
                : "border-transparent text-foreground/90 hover:border-primary/25 hover:bg-primary/10"
            }`}
            onClick={() => setShowMobileMenu(false)}
          >
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </Link>

          {dashboardLinkGroups.map((group) => (
            <div key={group.title} className="rounded-2xl border border-border/65 p-2">
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.links.map((to) => {
                  const link = getDashboardLink(to);
                  if (!link) {
                    return null;
                  }

                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        isDashboardLinkActive(link.to)
                          ? "border-primary/35 bg-primary/12 text-foreground"
                          : "border-transparent text-foreground/90 hover:border-primary/25 hover:bg-primary/10"
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return homeLinks.map((link) => {
      const sectionId = link.to.replace("#", "");
      const isActive = isHomeLinkActive(sectionId);
      return (
        <a
          key={link.label}
          href={link.to}
          onClick={(e) => handleSmoothScroll(e, sectionId)}
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-base font-medium transition ${
            isActive
              ? "border-primary/35 bg-primary/12 text-foreground"
              : "border-transparent text-foreground/90 hover:border-primary/25 hover:bg-primary/10"
          }`}
        >
          {link.icon}
          <span>{link.label}</span>
        </a>
      );
    });
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={`${shellClass} mx-auto max-w-6xl ${
          isScrolled ? "ring-1 ring-black/5" : ""
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 transition-all duration-300 sm:px-5 ${
            isScrolled ? "h-[66px]" : "h-[78px]"
          }`}
        >
          <Link
            to="/"
            onClick={handleLogoClick}
            className="group flex items-center gap-2 rounded-full px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Go to W4lkies home"
          >
            <div className={`transition-all duration-300 ${isScrolled ? "h-10" : "h-11"}`}>
              <Logo />
            </div>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center px-6 md:flex">
            <div className="flex flex-wrap items-center justify-center gap-5">
              {renderDesktopLinks()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center text-primary md:flex" aria-hidden="true">
              <PawPrint className="h-4 w-4" />
            </div>

            <button
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
              className="hidden rounded-full border border-border/70 bg-background/90 p-2 text-foreground/80 transition hover:-translate-y-0.5 hover:text-foreground md:inline-flex"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground/80 transition hover:border-primary/35 hover:bg-primary/10 hover:text-foreground md:hidden"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {!isAuthenticated ? (
              <>
                <Link
                  to="/signin"
                  className="hidden items-center justify-center rounded-full border border-border/70 px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:border-primary/35 hover:bg-primary/10 hover:text-foreground md:inline-flex"
                >
                  <LogIn className="mr-1 h-4 w-4" />
                  Sign In
                </Link>
              </>
            ) : (
              <>
                {isDashboardPage ? (
                  <Link
                    to="/"
                    className="hidden items-center justify-center rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground/80 transition hover:border-primary/35 hover:bg-primary/10 hover:text-foreground md:inline-flex"
                  >
                    <Home className="mr-1 h-4 w-4" />
                    Website
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/dashboard")}
                    className="hidden rounded-full border border-border/70 bg-background/80 px-4 text-foreground/80 hover:border-primary/30 hover:bg-primary/10 hover:text-foreground md:inline-flex"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="hidden rounded-full border border-border/70 bg-background/80 px-4 text-foreground/80 hover:border-primary/30 hover:bg-primary/10 hover:text-foreground md:inline-flex"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </>
            )}

            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground/80 transition hover:border-primary/35 hover:bg-primary/10 hover:text-foreground md:hidden"
              aria-label={showMobileMenu ? "Close menu" : "Open menu"}
              aria-expanded={showMobileMenu}
              onClick={() => setShowMobileMenu((prev) => !prev)}
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden border-t border-border/65 px-3 transition-all duration-300 md:hidden ${
            showMobileMenu ? "max-h-[70vh] py-3" : "max-h-0 py-0"
          }`}
        >
          <div className="space-y-1">{renderMobileLinks()}</div>

          <div className="mt-3 grid grid-cols-1 gap-2">
            {!isAuthenticated ? (
              <Link
                to="/signin"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-base font-semibold text-foreground"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            ) : (
              <>
                <Link
                  to={isDashboardPage ? "/" : "/dashboard"}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-base font-semibold text-foreground"
                >
                  {isDashboardPage ? <Home className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                  {isDashboardPage ? "Website" : "Dashboard"}
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-base font-semibold text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
