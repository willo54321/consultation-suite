'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-[#025956]" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[#7dd3c0] text-sm font-medium tracking-[0.2em] uppercase mb-6"
        >
          Public Consultation
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="display-heading text-white mb-8"
        >
          Welcome to
          <br />
          <span className="text-[#7dd3c0]">Grove Heath North</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="sub-heading text-white/80 max-w-2xl mx-auto mb-12"
        >
          Green Kite Homes is developing a new residential community at Grove Heath North,
          located off Portsmouth Road. We are consulting with residents of Ripley, Burntcommon,
          and Send to gather feedback and refine our proposals.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a href="/feedback" className="bg-[#025956] text-white px-8 py-4 font-medium tracking-wide uppercase text-sm hover:bg-[#037471] transition-all">
            Have Your Say
          </a>
          <a href="#about" className="bg-white text-[#025956] px-8 py-4 font-medium tracking-wide uppercase text-sm hover:bg-gray-100 transition-all">
            Learn More
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown className="text-white/60" size={32} />
        </motion.div>
      </motion.div>
    </section>
  );
}
