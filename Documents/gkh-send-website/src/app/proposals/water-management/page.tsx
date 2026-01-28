'use client';

import { motion } from 'framer-motion';
import ProposalPageHeader from '@/components/ProposalPageHeader';
import LightboxImage from '@/components/LightboxImage';

export default function WaterManagementPage() {
  const sudsFeatures = [
    {
      title: 'Wetlands',
      description: 'Permanent water levels within green open space to provide attenuation and treatment of water.',
      image: '/images/wetland.png',
    },
    {
      title: 'Detention basins',
      description: 'Providing attenuation during heavy rainfall, but normally dry and functions as a recreational facility during dry periods. Gravel and vegetation provide water treatment prior to discharge.',
      image: '/images/detention-basin.png',
    },
    {
      title: 'Swales',
      description: 'Broad shallow permeable channels to convey and store run-off. Vegetation in the swale allows run-off to be treated and silt to be deposited.',
      image: '/images/swales.png',
    },
    {
      title: 'Water butts',
      description: 'One of the most common measures for property-level SUDs, collecting rainwater.',
      image: '/images/water-butts.png',
    },
    {
      title: 'Rain gardens',
      description: 'Shallow landscaped depression to collect rainwater from downpipe or from road and release slowly to ground or sewers to reduce the volume of run-off.',
      image: '/images/rain-garden.png',
    },
    {
      title: 'Lined permeable pavement',
      description: 'Would provide water quality benefits, while attenuating and slowing down water flows.',
      image: '/images/lined-permeable-pavement.png',
    },
  ];

  return (
    <>
      <ProposalPageHeader
        title="Water Management & Sustainability"
        subtitle="Integrating blue and green infrastructure has been a key consideration from the outset."
        prevPage={{ name: 'Landscape & Ecology', href: '/proposals/landscape-ecology' }}
        nextPage={{ name: 'Infrastructure', href: '/proposals/infrastructure' }}
      />

      {/* Introduction */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[#6B7280] text-lg leading-relaxed mb-6">
                Integrating blue and green infrastructure has been a key consideration from the outset,
                due to the East Clandon Stream running along the site&apos;s western boundary, the unnamed
                Ordinary Watercourse along the north and northwestern boundary, and the Papercourt
                Lake SSSI outside the site to the northwest.
              </p>
              <p className="text-[#6B7280] text-lg leading-relaxed mb-6">
                The site is mainly Flood Zone 1 (Low risk) with some Zones 2 and 3 at the western edge.
                A site-specific Flood Risk Assessment is being prepared and will be incorporated into our
                water strategy to produce robust flood mitigation measures and increase biodiversity.
              </p>
              <p className="text-[#6B7280] text-lg leading-relaxed">
                The proposed water approach retains and enhances existing water bodies such as
                areas of ponding and an existing surface water flow route to the east of the site.
              </p>
            </motion.div>

            {/* SUDs Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-[#025956] p-8">
                <h3 className="text-xl font-semibold text-white mb-4 heading-font">
                  Sustainable Urban Drainage Systems (SUDs)
                </h3>
                <p className="text-white/90 mb-6">
                  SUDs mimic the natural drainage system, decreasing flood risk and improving water
                  quality before discharge. The use of vegetation also creates new habitats, in-line
                  with our BNG and SANG aims.
                </p>
                <div className="bg-white/10 p-4 border border-white/20">
                  <p className="text-[#7dd3c0] font-medium mb-2">Key Outcome</p>
                  <p className="text-white/90 text-sm">
                    Surface water discharge will be restricted to &apos;greenfield run-off&apos; (the natural
                    flow of rainwater from a site in its undeveloped natural state).
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SUDs Features */}
      <section className="section-padding bg-[#F8F9F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-[#1E1E1E] mb-12 heading-font"
          >
            SUDs Features
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sudsFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6"
              >
                {feature.image ? (
                  <LightboxImage
                    src={feature.image}
                    alt={feature.title}
                    className="w-full aspect-video object-cover mb-4"
                  />
                ) : (
                  <div className="w-full aspect-video bg-[#F8F9F7] mb-4 flex items-center justify-center">
                    <span className="text-[#6B7280] text-sm">{feature.title} illustration</span>
                  </div>
                )}
                <h4 className="font-semibold text-[#1E1E1E] mb-2">{feature.title}</h4>
                <p className="text-[#6B7280] text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
