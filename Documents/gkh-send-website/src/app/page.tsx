import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import EnquiriesSection from '@/components/EnquiriesSection';
import NewsCarousel from '@/components/NewsCarousel';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <AboutSection />
        <EnquiriesSection />
        <NewsCarousel />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
