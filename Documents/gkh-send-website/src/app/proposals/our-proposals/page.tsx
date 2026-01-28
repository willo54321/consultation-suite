'use client';

import { motion } from 'framer-motion';
import ProposalPageHeader from '@/components/ProposalPageHeader';
import LightboxImage from '@/components/LightboxImage';

export default function OurProposalsPage() {
  const proposals = [
    {
      title: 'Green Infrastructure',
      description: 'A significant amount of retained and enhanced green infrastructure with at least 30 percent of the site green open space.',
      highlight: '30%+',
      highlightLabel: 'Green Space',
    },
    {
      title: 'New Homes',
      description: 'Around 540 new homes to meet identified housing need. High quality homes in a range of house sizes from smaller starter homes to larger family homes.',
      highlight: '540',
      highlightLabel: 'New Homes',
    },
    {
      title: 'Affordable Housing',
      description: '50% affordable housing comprising a mix of rented and intermediate homes.',
      highlight: '50%',
      highlightLabel: 'Affordable',
    },
    {
      title: 'Ecological Enhancements',
      description: 'Ecological enhancements to ensure people and nature thrive together.',
      highlight: '10%+',
      highlightLabel: 'BNG',
    },
  ];

  const features = [
    'Play areas, village green, and community gardens.',
    'Enhanced dog walking routes and improvements to the Public Rights of Way.',
    'Flexible community or commercial space.',
    'Highways improvements and infrastructure provision.',
  ];

  return (
    <>
      <ProposalPageHeader
        title="Our Proposals"
        subtitle="A landscape-led residential development delivering high-quality homes and community facilities."
        prevPage={{ name: 'Our Vision', href: '/proposals/our-vision' }}
        nextPage={{ name: 'Landscape & Ecology', href: '/proposals/landscape-ecology' }}
      />

      {/* Key Proposals */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-semibold text-[#1E1E1E] mb-4 heading-font">
              Key Proposals
            </h2>
            <p className="text-[#6B7280] text-lg max-w-3xl">
              Our current proposals are for a landscape-led residential development that would provide:
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {proposals.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#F8F9F7] p-8"
              >
                <div className="flex items-start gap-6">
                  <div className="text-center flex-shrink-0">
                    <span className="block text-4xl font-light text-[#025956]">{item.highlight}</span>
                    <span className="text-[#6B7280] text-sm">{item.highlightLabel}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#1E1E1E] mb-2 heading-font">
                      {item.title}
                    </h3>
                    <p className="text-[#6B7280]">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="section-padding bg-[#025956]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-semibold text-white mb-8 heading-font">
              Community Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <span className="w-3 h-3 bg-[#7dd3c0] rounded-full mt-1.5 flex-shrink-0" />
                  <p className="text-white/90 text-lg">{feature}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Layout Image */}
      <section className="section-padding bg-[#F8F9F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h3 className="text-2xl font-semibold text-[#1E1E1E] mb-8 heading-font">
              Indicative Layout
            </h3>
            <LightboxImage
              src="/images/indicative-layout.webp"
              alt="Indicative layout of a possible development at Grove Heath North"
              className="w-full max-w-5xl mx-auto rounded-lg"
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}
