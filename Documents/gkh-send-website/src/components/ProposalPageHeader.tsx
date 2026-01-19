'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProposalPageHeaderProps {
  title: string;
  subtitle?: string;
  prevPage?: { name: string; href: string };
  nextPage?: { name: string; href: string };
}

export default function ProposalPageHeader({ title, subtitle, prevPage, nextPage }: ProposalPageHeaderProps) {
  return (
    <section className="bg-[#025956] pt-32 md:pt-40 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#7dd3c0] text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Our Proposals
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white heading-font mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/80 text-lg md:text-xl max-w-3xl">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-between items-center mt-8 pt-8 border-t border-white/20"
        >
          {prevPage ? (
            <Link
              href={prevPage.href}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
              <span className="text-sm uppercase tracking-wide">{prevPage.name}</span>
            </Link>
          ) : (
            <div />
          )}
          {nextPage ? (
            <Link
              href={nextPage.href}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="text-sm uppercase tracking-wide">{nextPage.name}</span>
              <ChevronRight size={20} />
            </Link>
          ) : (
            <div />
          )}
        </motion.div>
      </div>
    </section>
  );
}
