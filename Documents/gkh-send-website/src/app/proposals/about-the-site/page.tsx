'use client';

import { motion } from 'framer-motion';
import ProposalPageHeader from '@/components/ProposalPageHeader';

export default function AboutTheSitePage() {
  return (
    <>
      <ProposalPageHeader
        title="About the Site"
        subtitle="The Grove Heath North site is a total of 25.9 hectares with unique characteristics that make it suitable for development."
        nextPage={{ name: 'Sustainable Location', href: '/proposals/sustainable-location' }}
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
              <p className="text-[#6B7280] text-lg leading-relaxed mb-8">
                The Grove Heath North site comprises an area of previous clay extraction at the north
                of the site, some commercial storage and hardstanding at the southern portion and
                grassland on the rest of the site.
              </p>
              <p className="text-[#6B7280] text-lg leading-relaxed mb-8">
                Grove Heath North is the name given by Guildford Borough Council to this site, though
                this does not imply it will be the name of the development going forward. We recognise
                that many locals may know the site as Highlands Farm and would welcome any ideas for
                a new name.
              </p>

              {/* Site Characteristics */}
              <div className="bg-[#025956] p-8 mt-8">
                <h3 className="text-xl font-semibold text-white mb-6 heading-font">Site Characteristics</h3>
                <ul className="space-y-4">
                  {[
                    'Located to the north of Send Marsh village, within the Wisley Common Special Protection Area (SPA).',
                    'Previously developed land with farm buildings on site.',
                    'Many mature trees on the site and a woodland to the south-east. Our proposals retain as many as possible.',
                    'Existing site access from Portsmouth Road.',
                    'Electricity power lines cross the middle of the site, north to south. These would be moved underground with UKPN permission.',
                    'Adjacent to Papercourt Lake designated as a Site of Special Scientific Interest (SSSI). Respecting the SSSI area is a key consideration for our proposals.',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-white/90">
                      <span className="w-2 h-2 bg-[#7dd3c0] rounded-full mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right - Stats/Images */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Site Size Card */}
              <div className="bg-[#F8F9F7] p-8 text-center">
                <span className="block text-6xl font-light text-[#025956] mb-2">25.9</span>
                <span className="text-[#6B7280] text-lg">Hectares Total Site Area</span>
              </div>

              {/* Image Placeholders */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8F9F7] aspect-square flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-[#6B7280] text-sm">Electricity pylons and previously developed land</p>
                  </div>
                </div>
                <div className="bg-[#F8F9F7] aspect-square flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-[#6B7280] text-sm">Existing trees and public right of way</p>
                  </div>
                </div>
                <div className="bg-[#F8F9F7] aspect-square flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-[#6B7280] text-sm">Existing access road</p>
                  </div>
                </div>
                <div className="bg-[#F8F9F7] aspect-square flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-[#6B7280] text-sm">Land uses map</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
