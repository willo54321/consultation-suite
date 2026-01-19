'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, TreePine, Users, Leaf } from 'lucide-react';

const tabs = [
  {
    id: 'homes',
    name: 'Homes',
    icon: Home,
    title: 'Up to 540 homes',
    description:
      'Up to 540 homes in a range of sizes and tenures. Our proposals include a mix of housing types designed to meet diverse local needs, from starter homes for first-time buyers to larger family houses.',
    features: [
      'Range of house sizes and types',
      'Mix of tenures including affordable',
      'High-quality design standards',
      'Sustainable construction methods',
    ],
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'village-green',
    name: 'Village Green',
    icon: TreePine,
    title: 'Village green',
    description:
      'Extensive landscaping and open spaces at the heart of the development. A central village green will provide a focal point for the community, with space for recreation, relaxation, and community events.',
    features: [
      'Central village green',
      'Extensive landscaping throughout',
      'Connected green corridors',
      'Recreation and play areas',
    ],
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'community',
    name: 'Community Hub',
    icon: Users,
    title: 'Community hub',
    description:
      'Flexible community hub or small commercial units that bring neighbours together. This space could accommodate a range of uses to meet local needs, from community activities to small businesses.',
    features: [
      'Flexible community space',
      'Potential for small commercial units',
      'Meeting and event facilities',
      'Supporting local economy',
    ],
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'ecology',
    name: 'Ecology',
    icon: Leaf,
    title: 'Ecological focus',
    description:
      'Biodiversity enhancements, wildlife corridors, and connected footpaths. Our proposals are designed to deliver measurable biodiversity net gain and create new habitats for local wildlife.',
    features: [
      'Biodiversity net gain',
      'Wildlife corridors and habitats',
      'Connected footpath network',
      'Native planting schemes',
    ],
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  },
];

export default function TabbedSection() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const activeContent = tabs.find((tab) => tab.id === activeTab)!;

  return (
    <section id="vision" className="section-padding bg-[#F8F9F7]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[#025956] text-sm font-medium tracking-[0.2em] uppercase mb-4">
            Our Proposals
          </p>
          <h2 className="section-heading text-[#1E1E1E]">
            What we're proposing
          </h2>
        </motion.div>

        {/* Tabs */}
        <div className="relative mb-12">
          <div className="flex justify-center gap-2 md:gap-8 flex-wrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[#025956] text-[#025956]'
                      : 'border-transparent text-[#6B7280] hover:text-[#025956]'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                src={activeContent.image}
                alt={activeContent.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div>
              <h3 className="text-3xl md:text-4xl font-light text-[#1E1E1E] mb-6">
                {activeContent.title}
              </h3>
              <p className="text-[#6B7280] text-lg leading-relaxed mb-8">
                {activeContent.description}
              </p>
              <ul className="space-y-4">
                {activeContent.features.map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-[#1E1E1E]"
                  >
                    <span className="w-2 h-2 bg-[#025956] rounded-full" />
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
