import AppNavbar from "@/components/AppNavbar";
import SignupForm from "@/components/SignupForm";
import { PawPrint } from "lucide-react";
import Footer from "@/components/Footer";

const SignUp = () => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_35%,hsl(var(--muted)/0.45)_100%)] transition-colors duration-200">
      <AppNavbar />

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:pt-12">
        <div className="pointer-events-none absolute left-1/2 top-0 h-52 w-screen -translate-x-1/2 bg-[radial-gradient(circle_at_18%_14%,rgba(255,153,74,0.2),transparent_48%),radial-gradient(circle_at_84%_8%,rgba(150,188,172,0.18),transparent_42%)]" />

        <div className="relative mb-8 flex flex-col items-center sm:mb-10">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-semibold tracking-wide text-foreground">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <PawPrint className="h-4 w-4" />
            </span>
            Your dog deserves the best care in Chiswick
          </div>
          <h1 className="mb-3 text-center text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Sign Up for W4lkies Services
          </h1>
        </div>

        <div className="relative mx-auto w-full max-w-6xl">
          <SignupForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
