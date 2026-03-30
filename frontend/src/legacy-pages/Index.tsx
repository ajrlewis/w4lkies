import AppNavbar from "@/components/AppNavbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/index/HeroSection";
import LearnMoreSection from "@/components/index/LearnMoreSection";
import AboutSection from "@/components/index/AboutSection";
import ServicesSection from "@/components/index/ServicesSection";
import TeamSection from "@/components/index/TeamSection";
import DogsSection from "@/components/index/DogsSection";
import ContactSection from "@/components/index/ContactSection";
import SectionNavigation from "@/components/index/SectionNavigation";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-clip bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_35%,hsl(var(--muted)/0.45)_100%)] transition-colors duration-200">
      <AppNavbar />
      <HeroSection />
      <LearnMoreSection />
      <AboutSection />
      <SectionNavigation targetId="services" label="Our Services" />
      <ServicesSection />
      <SectionNavigation targetId="team" label="Meet Our Team" />
      <TeamSection />
      <SectionNavigation targetId="happy-dogs" label="See Happy Dogs" />
      <DogsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
