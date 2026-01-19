import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
