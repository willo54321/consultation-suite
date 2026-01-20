'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { newsItems } from '@/data/news';

// Re-export for backwards compatibility
export { newsItems };

export default function NewsCarousel() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <section id="news" className="section-padding bg-[#e6f2f1]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="section-heading text-[#1E1E1E] max-w-lg">
              News
            </h2>
          </motion.div>

          {/* Navigation Arrows */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex gap-3 mt-8 lg:mt-0"
          >
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                canScrollLeft
                  ? 'border-[#025956] text-[#025956] hover:bg-[#025956] hover:text-white'
                  : 'border-gray-300 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Previous"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                canScrollRight
                  ? 'border-[#025956] text-[#025956] hover:bg-[#025956] hover:text-white'
                  : 'border-gray-300 text-gray-300 cursor-not-allowed'
              }`}
              aria-label="Next"
            >
              <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          onScroll={checkScrollButtons}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {newsItems.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="flex-shrink-0 w-[320px] md:w-[380px]"
              style={{ scrollSnapAlign: 'start' }}
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

                {/* Content */}
                <h3 className="text-xl md:text-2xl font-medium text-[#1E1E1E] mb-3 group-hover:text-[#025956] transition-colors heading-font leading-tight">
                  {item.title}
                </h3>
                <p className="text-[#6B7280] text-sm leading-relaxed line-clamp-3">
                  {item.excerpt}
                </p>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-[#025956] font-medium hover:gap-4 transition-all"
          >
            View all news
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
