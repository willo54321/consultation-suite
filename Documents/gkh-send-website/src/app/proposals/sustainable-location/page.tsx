'use client';

import { motion } from 'framer-motion';
import ProposalPageHeader from '@/components/ProposalPageHeader';

export default function SustainableLocationPage() {
  const amenities = [
    { name: 'Ripley Village Centre', distance: "14 minutes' walk" },
    { name: 'Ripley Church of England Primary School', distance: "13 minutes' walk" },
    { name: 'The Jovial Sailor pub', distance: "5 minutes' walk" },
    { name: 'Little Waitrose and Shell garage', distance: "9 minutes' walk" },
    { name: 'Papercourt Sailing Club', distance: "12 minutes' walk" },
  ];

  const transportLinks = [
    { name: 'Grove Heath Road bus stops', distance: 'Around 200 metres' },
    { name: 'Tuckey Grove bus stops', distance: 'Around 100 metres' },
    { name: 'Clandon railway station', distance: '3.6 km' },
    { name: 'Woking railway station', distance: '6.8 km' },
  ];

  return (
    <>
      <ProposalPageHeader
        title="A Sustainable Location"
        subtitle="The site offers excellent connectivity to local amenities and transport links, making it an ideal location for sustainable living."
        prevPage={{ name: 'About the Site', href: '/proposals/about-the-site' }}
        nextPage={{ name: 'Our Vision', href: '/proposals/our-vision' }}
      />

      {/* Policy Context */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h2 className="text-3xl font-semibold text-[#1E1E1E] mb-6 heading-font">Policy Context</h2>
            <p className="text-[#6B7280] text-lg leading-relaxed mb-6">
              The site sits within designated Green Belt in the Guildford Local Plan and within
              Lovelace Ward & Neighbourhood Plan Area. It is being promoted as a development
              site within the emerging Local Plan.
            </p>
            <p className="text-[#6B7280] text-lg leading-relaxed">
              This sustainable location offers the opportunity to meet current NPPF policies on
              appropriate Green Belt development and help deliver the NPPF&apos;s new homes target
              for Guildford Borough Council.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Amenities & Transport */}
      <section className="section-padding bg-[#F8F9F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-[#025956] p-8">
                <h3 className="text-xl font-semibold text-white mb-6 heading-font">
                  Amenities Within Walking Distance
                </h3>
                <div className="space-y-4">
                  {amenities.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3 border-b border-white/20 last:border-0"
                    >
                      <span className="text-white/90">{item.name}</span>
                      <span className="text-[#7dd3c0] font-medium">{item.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Transport Links */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-[#025956] p-8">
                <h3 className="text-xl font-semibold text-white mb-6 heading-font">
                  Transport Links
                </h3>
                <div className="space-y-4">
                  {transportLinks.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-3 border-b border-white/20 last:border-0"
                    >
                      <span className="text-white/90">{item.name}</span>
                      <span className="text-[#7dd3c0] font-medium">{item.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bus Routes Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { route: '463', description: 'Woking - Guildford' },
              { route: '462', description: 'Woking - Guildford' },
              { route: 'Kingston', description: 'Kingston - Guildford' },
            ].map((bus, index) => (
              <div key={index} className="bg-white p-6 text-center">
                <span className="block text-2xl font-semibold text-[#025956] mb-1">{bus.route}</span>
                <span className="text-[#6B7280] text-sm">{bus.description}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
