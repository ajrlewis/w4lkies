import AppNavbar from "@/components/AppNavbar";
import SignupForm from "@/components/SignupForm";
import Logo from "@/assets/logo";
import { PawPrint } from "lucide-react";
import Footer from "@/components/Footer";

const SignUp = () => {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-secondary/15 transition-colors duration-200">
      <AppNavbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10 lg:py-12">
        <div className="mb-8 flex flex-col items-center sm:mb-10">
          <div className="mb-4 h-24 w-auto animate-fade-in sm:h-28 md:h-32">
            <Logo />
          </div>
          <h1 className="mb-3 text-center text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Sign Up for W4lkies Services
          </h1>
          <div className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground sm:text-base">
            <PawPrint className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
            <span>Your dog deserves the best care in Chiswick</span>
          </div>
        </div>

        <div className="mx-auto max-w-4xl rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6 md:p-8">
          <SignupForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
