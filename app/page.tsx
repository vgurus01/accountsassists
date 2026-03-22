import AboutSection from "./sections/AboutSection";
import BookingSection from "./sections/BookingSection";
import ContactSection from "./sections/ContactSection";
import Footer from "./sections/Footer";
import Header from "./sections/Header";
import HeroSection from "./sections/HeroSection";
import ServicesSection from "./sections/ServicesSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <BookingSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
