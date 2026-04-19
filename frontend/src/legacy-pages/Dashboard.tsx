import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import {
  User,
  Users,
  BriefcaseMedical,
  Dog,
  Wrench,
  Calendar,
  FileText,
  Wallet,
  KeyRound,
  Link2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { username, isAdmin } = useAuth();

  const dashboardSections = isAdmin
    ? [
        {
          id: "operations",
          title: "Operations",
          items: [
            { name: "Bookings", icon: Calendar, path: "/dashboard/bookings" },
            { name: "Invoices", icon: FileText, path: "/dashboard/invoices" },
            { name: "Expenses", icon: Wallet, path: "/dashboard/expenses" },
            { name: "Reconciliation", icon: Link2, path: "/dashboard/reconciliation" },
          ],
        },
        {
          id: "directory",
          title: "Directory",
          items: [
            { name: "Customers", icon: Users, path: "/dashboard/customers" },
            { name: "Dogs", icon: Dog, path: "/dashboard/dogs" },
            { name: "Vets", icon: BriefcaseMedical, path: "/dashboard/vets" },
            { name: "Services", icon: Wrench, path: "/dashboard/services" },
          ],
        },
        {
          id: "management",
          title: "Management",
          items: [
            { name: "Users", icon: User, path: "/dashboard/users" },
            { name: "Account", icon: KeyRound, path: "/dashboard/account" },
          ],
        },
      ]
    : [
        {
          id: "operations",
          title: "Operations",
          items: [{ name: "Bookings", icon: Calendar, path: "/dashboard/bookings" }],
        },
        {
          id: "management",
          title: "Management",
          items: [{ name: "Account", icon: KeyRound, path: "/dashboard/account" }],
        },
      ];

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-200">
      <AppNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8 lg:p-12">
        <div className="mb-8 lg:mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            Welcome, {username || "User"}!
          </h1>
          <p className="mt-2 text-lg text-muted-foreground lg:text-xl">
            Manage your dog walking business from your dashboard.
          </p>
        </div>

        <div className="space-y-6 lg:space-y-8">
          {dashboardSections.map((section) => (
            <section
              key={section.title}
              id={section.id}
              className="scroll-mt-24 rounded-2xl border border-border/65 bg-background/70 p-4 shadow-sm lg:p-6"
            >
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {section.title}
              </h2>
              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                {section.items.map((item) => (
                  <Link key={item.name} to={item.path} className="group block w-full">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-32 w-full rounded-xl border-border/60 bg-gradient-to-br from-primary/20 to-secondary/30 text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md lg:h-36"
                    >
                      <div className="flex flex-col items-center justify-center gap-3 lg:gap-4">
                        <item.icon className="h-8 w-8 transition-transform group-hover:scale-110 lg:h-10 lg:w-10" />
                        <span className="text-base font-semibold lg:text-lg">{item.name}</span>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
