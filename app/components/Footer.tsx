'use client';

import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Send,
  ArrowRight
} from 'lucide-react';
import React, { useState, useMemo, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';

/**
 * Footer component
 *
 * - Uses the public `/map.jpg` image as a full-bleed background.
 * - Adds a subtle dark overlay for text readability.
 * - Keeps the existing animated waves/particles and footer content on top.
 */

export function Footer() {
  const [email, setEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Deterministic particles to avoid hydration mismatch
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        initialX: (i * 6.1 + 7) % 100,
        initialY: (i * 4.4 + 10) % 100,
        positions: [
          (i * 3.3 + 15) % 100,
          (i * 5.1 + 40) % 100,
          (i * 2.7 + 60) % 100
        ],
        duration: (i % 4) * 2 + 8
      })),
    []
  );

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // replace with real subscription logic
    console.log('Subscribe:', email);
    setEmail('');
  };

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Team', href: '/team' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' }
    ],
    services: [
      { name: 'Tours & Travel', href: '/tours' },
      { name: 'Education Services', href: '/education' },
      { name: 'Student Admission', href: '/admissions' },
      { name: 'Visa Assistance', href: '/visa' }
    ],
    destinations: [
      { name: 'Cape Coast', href: '/destinations/cape-coast' },
      { name: 'Kumasi', href: '/destinations/kumasi' },
      { name: 'Kakum National Park', href: '/destinations/kakum' },
      { name: 'Volta Region', href: '/destinations/volta' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Refund Policy', href: '/refund' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' }
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Background image - using public/map.jpg */}
      <img src="/map.jpg" alt="" aria-hidden className="absolute inset-0 z-0 w-full h-full object-cover" style={{ filter: 'saturate(0.95) contrast(0.95) brightness(0.95)', opacity: 0.95 }} />

      {/* Subtle overlay to ensure readability */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0.42) 35%, rgba(0,0,0,0.18) 70%)'
        }}
      />

      {/* Decorative animated layer (waves & particles) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Animated waves (subtle, using radial gradients) */}
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPosition: ['0% 30%', '100% 70%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{
            background:
              'radial-gradient(circle at 15% 30%, rgba(255,255,255,0.02), transparent 10%), radial-gradient(circle at 85% 70%, rgba(255,255,255,0.02), transparent 12%)',
            backgroundSize: '200% 200%',
            mixBlendMode: 'overlay'
          }}
        />

        {mounted &&
          particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-white/10"
              initial={{ x: `${p.initialX}%`, y: `${p.initialY}%`, width: 6, height: 6 }}
              animate={{
                x: p.positions.map((v) => `${v}%`),
                y: p.positions.map((v) => `${(v + 10) % 100}%`)
              }}
              transition={{ duration: p.duration, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
              style={{ width: 6, height: 6 }}
            />
          ))}
      </div>

      {/* Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.65)' }}>
        {/* Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16 text-center"
        >
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Stay Updated with <span className="text-primary-300">Godfirst Education and Tours</span>
          </h3>
          <p className="text-sm sm:text-base mb-6 sm:mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for travel deals, education opportunities, and local experiences.
          </p>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                required
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Send size={16} />
                <span className="sm:inline">Subscribe</span>
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="sm:col-span-2 lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://static.wixstatic.com/media/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png/v1/crop/x_766,y_673,w_3882,h_2984/fill/w_62,h_52,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png"
                alt="Godfirst Education and Tours"
                className="h-8 sm:h-10 w-auto"
              />
              <span className="text-xl sm:text-2xl font-bold">Godfirst Education and Tours</span>
            </div>
            <p className="text-sm sm:text-base mb-6 max-w-sm text-white/90">
              Your trusted partner for educational excellence and unforgettable travel experiences across Ghana and beyond.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-200 mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm">Jah Love Junction, Kwashieman, Accra, Ghana</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary-200 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">0558735654</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary-200 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">0537579919</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary-200 flex-shrink-0" />
                <span className="text-xs sm:text-sm break-all">info@godfirstedu.com</span>
              </div>
            </div>
          </motion.div>

          {/* Links sections */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <h4 className="text-base sm:text-lg font-bold mb-3">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-sm hover:text-primary transition-colors flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 opacity-80" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}>
            <h4 className="text-base sm:text-lg font-bold mb-3">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-sm hover:text-primary transition-colors flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 opacity-80" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }}>
            <h4 className="text-base sm:text-lg font-bold mb-3">Destinations</h4>
            <ul className="space-y-2">
              {footerLinks.destinations.map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-sm hover:text-primary transition-colors flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 opacity-80" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Social & legal */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }} className="pt-6 sm:pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/6 border border-white/10 flex items-center justify-center text-white hover:bg-primary/90 transition-all"
                >
                  <s.icon size={16} />
                </motion.a>
              ))}

              <div className="ml-2">
                <ThemeToggle />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              {footerLinks.legal.map((link, idx) => (
                <a key={idx} href={link.href} className="hover:text-primary transition-colors">
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <div className="text-center text-xs sm:text-sm">
            <p className="mb-1 sm:mb-2">© {new Date().getFullYear()} Godfirst Education and Tours. All rights reserved.</p>
            <p>Made with ❤️ in Ghana</p>
          </div>
        </motion.div>
      </div>

      {/* Bottom decorative bar */}
      <div className="absolute bottom-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg,#0ea5e9,#f59e0b,#ef4444)' }} />
    </footer>
  );
}

export default Footer;