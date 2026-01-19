'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function MapPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        {/* Hero Header */}
        <section className="bg-[#025956] pt-32 pb-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft size={18} />
              Back to home
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="display-heading text-white"
            >
              Interactive Map
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="sub-heading text-white/70 mt-6 max-w-2xl"
            >
              Explore the proposed development site and share your feedback directly on the map.
            </motion.p>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <iframe
                src="https://consult-ai-mauve.vercel.app/embed/cmki5h8y80000ws6pbthwgyns"
                width="100%"
                height="700"
                frameBorder="0"
                allow="geolocation"
                style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
            </motion.div>

            <div className="mt-8 text-center">
              <p className="text-[#6B7280] mb-4">
                Click on the map to leave feedback about specific areas of the proposed development.
              </p>
              <Link
                href="/feedback"
                className="inline-block bg-[#025956] text-white px-8 py-4 font-medium tracking-wide uppercase text-sm hover:bg-[#037471] transition-all"
              >
                Complete Full Feedback Form
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
