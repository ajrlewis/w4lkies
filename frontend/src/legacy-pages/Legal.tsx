import { useEffect } from "react";
import AppNavbar from "@/components/AppNavbar";
import Footer from "@/components/Footer";

const Legal = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-200">
      <AppNavbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:py-14 lg:py-20">
        <h1 className="mb-10 text-3xl font-semibold tracking-tight text-foreground sm:mb-12 sm:text-4xl">
          Legal Information
        </h1>

        <section className="mb-12 sm:mb-16">
          <h2 id="terms" className="mb-5 text-2xl font-semibold text-foreground">
            Terms of Service
          </h2>
          <p className="mb-4 text-foreground">
            By using London W4lkies Ltd&apos;s services, you agree to these terms:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-foreground">
            <li>Dogs must be friendly with other dogs and people.</li>
            <li>Owners must provide leash, collar/harness, and any necessary medications.</li>
            <li>24-hour cancellation notice required to avoid full charge.</li>
            <li>
              Payment is due by the invoice due date specified. We accept multiple payment
              methods, including cash, credit/debit cards, and Bitcoin.
            </li>
            <li>London W4lkies Ltd reserves the right to refuse service to any dog.</li>
            <li>
              You authorize London W4lkies Ltd to care for your dog(s) in your absence and to
              transport them to a veterinary clinic for medical treatment if necessary. You
              understand that you will be responsible for payment for any treatment provided to
              your dog(s) by London W4lkies Ltd or the veterinary clinic. In the event that London
              W4lkies Ltd is unable to contact you or your emergency contact, you authorize London
              W4lkies Ltd and the veterinary clinic to make any necessary decisions regarding your
              dog(s)&apos; medical treatment. You understand that while London W4lkies Ltd will submit
              an insurance claim, each claim is handled on a case-by-case basis and approval from
              London W4lkies Ltd&apos;s insurance provider is not guaranteed. You acknowledge that you
              are financially responsible for all veterinary costs incurred by your dog(s) during
              their stay with London W4lkies Ltd, regardless of insurance coverage.
            </li>
          </ul>
        </section>

        <section className="mb-12 sm:mb-16">
          <h2 id="privacy-policy" className="mb-5 text-2xl font-semibold text-foreground">
            Privacy Policy
          </h2>
          <p className="mb-4 text-foreground">
            We process personal data in line with UK GDPR and the Data Protection Act 2018.
          </p>

          <h3 className="mb-2 text-lg font-semibold text-foreground">What we collect</h3>
          <ul className="mb-5 list-disc space-y-2 pl-6 text-foreground">
            <li>
              Contact form details: name, email address, and any information you include in your
              message.
            </li>
            <li>Customer account details needed to provide booked services.</li>
            <li>Service-related communications and booking history.</li>
          </ul>

          <h3 className="mb-2 text-lg font-semibold text-foreground">How we use your data</h3>
          <ul className="mb-5 list-disc space-y-2 pl-6 text-foreground">
            <li>To respond to enquiries and provide requested dog walking services.</li>
            <li>To manage bookings, billing, and customer support.</li>
            <li>To keep service and safety records where required.</li>
          </ul>

          <h3 className="mb-2 text-lg font-semibold text-foreground">Lawful bases</h3>
          <ul className="mb-5 list-disc space-y-2 pl-6 text-foreground">
            <li>Taking steps at your request before entering a service agreement.</li>
            <li>Performance of a contract where services are booked.</li>
            <li>Legitimate interests for day-to-day service administration and support.</li>
            <li>
              Consent where required, for example optional third-party content such as embedded
              maps.
            </li>
          </ul>

          <h3 className="mb-2 text-lg font-semibold text-foreground">Who receives data</h3>
          <ul className="mb-5 list-disc space-y-2 pl-6 text-foreground">
            <li>Only staff and service providers who need access to run the business.</li>
            <li>
              Service providers may include website hosting, email delivery, and payment providers.
            </li>
            <li>We do not sell personal data to third parties.</li>
          </ul>

          <h3 className="mb-2 text-lg font-semibold text-foreground">Retention</h3>
          <ul className="mb-5 list-disc space-y-2 pl-6 text-foreground">
            <li>Enquiry messages are retained only as long as needed to handle the enquiry.</li>
            <li>
              Customer and transaction records are retained for legal, tax, and accounting
              obligations.
            </li>
          </ul>

          <h3 className="mb-2 text-lg font-semibold text-foreground">Your rights</h3>
          <ul className="list-disc space-y-2 pl-6 text-foreground">
            <li>Request access to your personal data.</li>
            <li>Request correction or deletion where applicable.</li>
            <li>Object to or restrict certain processing in some circumstances.</li>
            <li>Complain to the Information Commissioner&apos;s Office (ICO) if needed.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-5 text-2xl font-semibold text-foreground">Cookie Policy</h2>
          <p className="mb-4 text-foreground">
            Our website uses limited storage and access technologies:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-foreground">
            <li>Essential storage for website functionality such as display preferences.</li>
            <li>
              Optional third-party map content is loaded only if you choose to enable it on the
              contact section.
            </li>
            <li>We do not currently use advertising cookies.</li>
            <li>You can clear or block storage in your browser settings at any time.</li>
          </ul>
        </section>

        <footer className="mt-10 border-t border-border/70 pt-6 sm:mt-12 sm:pt-8">
          <p className="text-sm text-muted-foreground">Last Updated: March 26, 2026</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We may update these policies from time to time to reflect changes in our services,
            legal requirements, or business practices. We encourage you to review these policies
            periodically for any changes.
          </p>
        </footer>
      </main>

      <Footer />
    </div>
  );
};

export default Legal;
