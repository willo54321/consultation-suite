'use client';

import { motion } from 'framer-motion';
import ProposalPageHeader from '@/components/ProposalPageHeader';

export default function LandscapeEcologyPage() {
  const designPrinciples = [
    {
      title: 'Increased biodiversity',
      description: 'Delivering a landscape which contributes to a net gain in biodiversity, retaining and enhancing existing ecosystems.',
    },
    {
      title: 'Integrated green and blue infrastructure',
      description: 'An integrated approach to tackle issues of water neutrality.',
    },
    {
      title: 'Accessibility and inclusivity',
      description: 'Creating an accessible landscape that provides opportunities for all users, with strong links to the wider landscape.',
    },
    {
      title: 'Nature recovery networks',
      description: 'Incorporating ecological networks into the landscape strategy for the site, delivering a network of valuable connected habitats.',
    },
    {
      title: 'People, place and nature',
      description: 'Delivering an environment that is loved and appreciated by residents, and which has its own distinct character.',
    },
    {
      title: 'Sustainability',
      description: 'Create a sustainable and resilient landscape that can meet the challenges of the future.',
    },
    {
      title: 'Community enhancement',
      description: 'Delivering a landscape that enhances the wellbeing of the community, bringing people together.',
    },
    {
      title: 'Edible landscapes and community gardens',
      description: 'Deliver public benefit through the creation of interactive landscapes.',
    },
  ];

  const landscapeFeatures = [
    'The westernmost section of the site retained as a landscape buffer, providing separation between Send Marsh, and Papercourt SSSI and the new development.',
    'Provision of a Suitable Alternative Natural Green Space (SANG) to protect the adjacent Special Protection Area. Our proposals exceed all SANG requirements, providing a circular walking route of 2.5 km.',
    'A walkable community through enhanced Public Rights of Ways and improving connectivity and accessibility to natural assets.',
    'Large linear parks and green infrastructure networks promoting biodiversity and allow both people and nature to thrive.',
    'Substantial play space of 0.64ha in a mix of equipped and informal play spaces, spread throughout the site.',
  ];

  return (
    <>
      <ProposalPageHeader
        title="Landscape & Ecology"
        subtitle="Enhancing the landscape and creating green infrastructure has been at the heart of the development approach."
        prevPage={{ name: 'Our Proposals', href: '/proposals/our-proposals' }}
        nextPage={{ name: 'Water Management', href: '/proposals/water-management' }}
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
                Our proposals incorporate a wide range of land uses and habitat types, including
                Site of Alternative Natural Greenspace (SANG), Public Amenity Space, Private Gardens,
                Public Parks, and Orchards.
              </p>
              <p className="text-[#6B7280] text-lg leading-relaxed">
                The purpose is to create a vibrant, and inviting garden community rooted in the
                local landscape allowing people and nature to thrive together.
              </p>
            </motion.div>

            {/* SANG Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-[#025956] p-8">
                <h3 className="text-xl font-semibold text-white mb-4 heading-font">The SANG</h3>
                <p className="text-white/90 mb-6">
                  The Site will see the creation of a new 9.2ha Site of Alternative Natural
                  Greenspace (SANG), incorporating 4.2km of circular walking routes, which
                  connect to a further 2.4km of new onsite walks which pass through a further
                  3.5ha of semi-natural greenspace, parks and gardens, and amenity areas.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center py-4 border border-white/20">
                    <span className="block text-3xl font-light text-[#7dd3c0]">9.2ha</span>
                    <span className="text-white/70 text-sm">SANG Area</span>
                  </div>
                  <div className="text-center py-4 border border-white/20">
                    <span className="block text-3xl font-light text-[#7dd3c0]">4.2km</span>
                    <span className="text-white/70 text-sm">Walking Routes</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="section-padding bg-[#F8F9F7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-[#1E1E1E] mb-12 heading-font"
          >
            Landscape Design Principles
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {designPrinciples.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6"
              >
                <div className="w-3 h-3 bg-[#025956] rounded-full mb-4" />
                <h4 className="font-semibold text-[#1E1E1E] mb-2">{principle.title}</h4>
                <p className="text-[#6B7280] text-sm">{principle.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Landscape Features */}
      <section className="section-padding bg-[#025956]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-semibold text-white mb-8 heading-font"
          >
            Landscape Features
          </motion.h2>

          <div className="space-y-6">
            {landscapeFeatures.map((feature, index) => (
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
        </div>
      </section>
    </>
  );
}
