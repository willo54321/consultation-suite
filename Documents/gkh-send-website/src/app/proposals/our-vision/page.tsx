'use client';

import { motion } from 'framer-motion';
import ProposalPageHeader from '@/components/ProposalPageHeader';

export default function OurVisionPage() {
  const visionPoints = [
    'Landscape-led development with plentiful public green space; green networks and community village greens.',
    'Linked to but separate from the surrounding villages of Ripley and Send Marsh.',
    'Community focused: provision of community spaces and community gardens.',
    'Healthy living with substantial green and blue infrastructure.',
    'Active travel-focused with design that encourages walking, cycling and access to public transport.',
    'High-quality and sustainable homes and climate resilient planting.',
    'Homes with gardens, including opportunities to grow food.',
    'Design in-keeping with the identifiable local vernacular.',
    'Climate resilience, using zero-carbon and energy positive technology.',
  ];

  return (
    <>
      <ProposalPageHeader
        title="Our Vision"
        subtitle="A sustainable community driven by the principles of landscape-led development."
        prevPage={{ name: 'Sustainable Location', href: '/proposals/sustainable-location' }}
        nextPage={{ name: 'Our Proposals', href: '/proposals/our-proposals' }}
      />

      {/* Main Content */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-semibold text-[#1E1E1E] mb-6 heading-font">
                Landscape-led Development
              </h2>
              <p className="text-[#6B7280] text-lg leading-relaxed mb-6">
                The proposals are for a sustainable community driven by the principles of
                landscape-led development. We seek to create a self-contained community that
                would include easy access to jobs and community facilities.
              </p>
              <p className="text-[#6B7280] text-lg leading-relaxed">
                While the design detail of buildings will emerge in the later detailed planning
                application, the principles of our vision will guide the development throughout
                its life.
              </p>
            </motion.div>

            {/* Right - Vision Points */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-[#025956] p-8">
                <h3 className="text-xl font-semibold text-white mb-6 heading-font">Our Vision</h3>
                <ul className="space-y-4">
                  {visionPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3 text-white/90">
                      <span className="w-2 h-2 bg-[#7dd3c0] rounded-full mt-2 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Illustration Section */}
      <section className="section-padding bg-[#F8F9F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <img
              src="/images/ourvision1.webp"
              alt="Indicative sketch of green open space within the development"
              className="w-full max-w-4xl mx-auto rounded-lg"
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}
