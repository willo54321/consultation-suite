'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { newsItems } from '@/components/NewsCarousel';

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="bg-[#025956] pt-32 pb-20">
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
            News & Events
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="sub-heading text-white/70 mt-6 max-w-2xl"
          >
            Stay up to date with the latest news, events and updates from the Green Kite consultation.
          </motion.p>
        </div>
      </section>

      {/* News Grid */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item, index) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Link href={`/news/${item.slug}`} className="group block">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg mb-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Date Badge */}
                    <span className="absolute bottom-4 right-4 bg-[#025956] text-white text-xs font-medium tracking-wider uppercase px-4 py-2 rounded">
                      {item.date}
                    </span>
                  </div>

                  {/* Category */}
                  <span className="text-[#025956] text-xs font-medium tracking-[0.2em] uppercase">
                    {item.category}
                  </span>

                  {/* Content */}
                  <h2 className="text-xl md:text-2xl font-medium text-[#1E1E1E] mt-2 mb-3 group-hover:text-[#025956] transition-colors heading-font leading-tight">
                    {item.title}
                  </h2>
                  <p className="text-[#6B7280] text-sm leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
