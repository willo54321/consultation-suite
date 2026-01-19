'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const proposalPages = [
  {
    title: 'About the Site',
    description: 'Learn about the 25.9 hectare Grove Heath North site and its characteristics.',
    href: '/proposals/about-the-site',
  },
  {
    title: 'A Sustainable Location',
    description: 'Discover the transport links and local amenities within walking distance.',
    href: '/proposals/sustainable-location',
  },
  {
    title: 'Our Vision',
    description: 'Explore our landscape-led development principles and community focus.',
    href: '/proposals/our-vision',
  },
  {
    title: 'Our Proposals',
    description: 'See the details of our proposals including homes, green space, and community facilities.',
    href: '/proposals/our-proposals',
  },
  {
    title: 'Landscape & Ecology',
    description: 'Understand our approach to enhancing biodiversity and creating green infrastructure.',
    href: '/proposals/landscape-ecology',
  },
  {
    title: 'Water Management',
    description: 'Learn about our sustainable drainage systems and flood mitigation measures.',
    href: '/proposals/water-management',
  },
  {
    title: 'Infrastructure Requirements',
    description: 'Explore the infrastructure provisions including education, healthcare, and utilities.',
    href: '/proposals/infrastructure',
  },
  {
    title: 'Transport & Access',
    description: 'See our plans for vehicle, pedestrian, and cycle access to the site.',
    href: '/proposals/transport-access',
  },
  {
    title: 'Timeline & Next Steps',
    description: 'View the project timeline and find out how to have your say.',
    href: '/proposals/timeline',
  },
];

export default function ProposalsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-[#025956] pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#7dd3c0] text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Grove Heath North
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white heading-font mb-4">
              Our Proposals
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-3xl">
              Explore our detailed proposals for a new mixed-use development at Grove Heath North,
              within the parish of Ripley, northwest of Send Marsh.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Proposals Grid */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposalPages.map((page, index) => (
              <motion.div
                key={page.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={page.href}
                  className="group block bg-[#F8F9F7] p-8 h-full hover:bg-[#025956] transition-all duration-300"
                >
                  <span className="text-[#025956] text-sm font-medium tracking-wide uppercase group-hover:text-[#7dd3c0] transition-colors">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-2xl font-semibold text-[#1E1E1E] mt-4 mb-3 heading-font group-hover:text-white transition-colors">
                    {page.title}
                  </h3>
                  <p className="text-[#6B7280] mb-6 group-hover:text-white/80 transition-colors">
                    {page.description}
                  </p>
                  <div className="flex items-center gap-2 text-[#025956] group-hover:text-[#7dd3c0] transition-colors">
                    <span className="text-sm font-medium uppercase tracking-wide">Learn More</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
