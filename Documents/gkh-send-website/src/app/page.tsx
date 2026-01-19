import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import TabbedSection from '@/components/TabbedSection';
import ConsultationSection from '@/components/ConsultationSection';
import NewsCarousel from '@/components/NewsCarousel';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <AboutSection />
        <TabbedSection />
        <ConsultationSection />
        <NewsCarousel />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
