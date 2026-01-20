'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ArrowRight, ChevronDown } from 'lucide-react';

const proposalSubItems = [
  { name: 'About the Site', href: '/proposals/about-the-site' },
  { name: 'Sustainable Location', href: '/proposals/sustainable-location' },
  { name: 'Our Vision', href: '/proposals/our-vision' },
  { name: 'Our Proposals', href: '/proposals/our-proposals' },
  { name: 'Landscape & Ecology', href: '/proposals/landscape-ecology' },
  { name: 'Water Management', href: '/proposals/water-management' },
  { name: 'Infrastructure', href: '/proposals/infrastructure' },
  { name: 'Transport & Access', href: '/proposals/transport-access' },
  { name: 'Timeline', href: '/proposals/timeline' },
];

const navItems = [
  { name: 'About', href: '/#about', hasSubmenu: false },
  { name: 'Proposals', href: '/proposals', hasSubmenu: true, subItems: proposalSubItems },
  { name: 'Interactive Map', href: '/map', hasSubmenu: true },
  { name: 'Have Your Say', href: '/feedback', hasSubmenu: true },
  { name: 'Documents', href: '/documents', hasSubmenu: true },
  { name: 'News', href: '/news', hasSubmenu: true },
  { name: 'Contact', href: '/#contact', hasSubmenu: false },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled && !isMenuOpen
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <a href="/" className="flex items-center z-50">
              <img
                src="/GKH-Logo.webp"
                alt="Green Kite Homes"
                className={`h-12 lg:h-14 w-auto transition-all duration-300 ${
                  isScrolled && !isMenuOpen ? 'brightness-0' : 'brightness-0 invert'
                }`}
              />
            </a>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 transition-colors duration-300 z-50 ${
                isMenuOpen ? 'text-white' : isScrolled ? 'text-[#1E1E1E]' : 'text-white'
              }`}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-[#025956]"
          >
            <div className="h-full flex flex-col">
              {/* Header area with search */}
              <div className="px-6 lg:px-12 pt-24">
                {/* Search Bar */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-4 pb-6"
                >
                  <Search className="text-white/60" size={20} />
                  <input
                    type="text"
                    placeholder="SEARCH"
                    className="bg-transparent text-white placeholder-white/60 text-sm tracking-[0.2em] uppercase outline-none flex-1"
                  />
                </motion.div>

                {/* Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="h-px bg-white/30 origin-left"
                />
              </div>

              {/* Main content area */}
              <div className="flex-1 px-6 lg:px-12 pt-12 pb-8 overflow-auto">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:justify-between">
                  {/* Navigation Links */}
                  <div className="flex-1">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-white/60 text-xs tracking-[0.2em] uppercase mb-8"
                    >
                      Menu
                    </motion.p>

                    <nav className="space-y-2">
                      {navItems.map((item, index) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.08 }}
                        >
                          {item.subItems ? (
                            <div>
                              <button
                                onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                                className="group flex items-center justify-between py-2 text-white hover:text-white/70 transition-colors w-full text-left"
                              >
                                <span className="text-3xl md:text-4xl lg:text-5xl font-light heading-font">
                                  {item.name}
                                </span>
                                <span className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white/10 transition-colors ml-4">
                                  <ChevronDown
                                    size={20}
                                    className={`transition-transform duration-300 ${expandedItem === item.name ? 'rotate-180' : ''}`}
                                  />
                                </span>
                              </button>
                              <AnimatePresence>
                                {expandedItem === item.name && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden ml-4 border-l border-white/20 pl-6"
                                  >
                                    {item.subItems.map((subItem, subIndex) => (
                                      <motion.a
                                        key={subItem.name}
                                        href={subItem.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: subIndex * 0.05 }}
                                        className="block py-2 text-lg md:text-xl text-white/80 hover:text-white transition-colors"
                                      >
                                        {subItem.name}
                                      </motion.a>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ) : (
                            <a
                              href={item.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="group flex items-center justify-between py-2 text-white hover:text-white/70 transition-colors"
                            >
                              <span className="text-3xl md:text-4xl lg:text-5xl font-light heading-font">
                                {item.name}
                              </span>
                              {item.hasSubmenu && (
                                <span className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white/10 transition-colors ml-4">
                                  <ArrowRight size={20} />
                                </span>
                              )}
                            </a>
                          )}
                        </motion.div>
                      ))}
                    </nav>
                  </div>

                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
