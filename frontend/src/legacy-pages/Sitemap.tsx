import AppNavbar from "@/components/AppNavbar";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Sitemap = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-200">
      <AppNavbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:py-14 lg:py-20">
        <h1 className="mb-10 text-3xl font-semibold tracking-tight text-foreground sm:mb-12 sm:text-4xl">
          Site Map
        </h1>

        <h2 className="mb-5 text-2xl font-semibold text-foreground">Main Navigation</h2>
        <ul className="list-disc space-y-4 pl-6 text-foreground">
          <li>
            <Link to="/" className="text-accent hover:underline">
              Home
            </Link>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>
                <a href="/#about" className="hover:underline">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#services" className="hover:underline">
                  Our Services
                </a>
              </li>
              <li>
                <a href="/#team" className="hover:underline">
                  Our Team
                </a>
              </li>
              <li>
                <a href="/#dogs" className="hover:underline">
                  Our Dogs
                </a>
              </li>
              <li>
                <a href="/#contact" className="hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </li>

          <li>
            <Link to="/signup" className="text-accent hover:underline">
              Sign Up
            </Link>
          </li>

          <li>
            <Link to="/legal" className="text-accent hover:underline">
              Legal Information
            </Link>
            <ul className="mt-2 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Cookie Policy</li>
            </ul>
          </li>
        </ul>
      </main>

      <Footer />
    </div>
  );
};

export default Sitemap;
