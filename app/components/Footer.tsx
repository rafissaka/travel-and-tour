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
  Plane,
  GraduationCap,
  ArrowRight,
  Send
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';

export function Footer() {
  const [email, setEmail] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate particles deterministically to prevent hydration mismatch
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      initialX: (i * 5.3 + 10) % 100,
      initialY: (i * 7.1 + 15) % 100,
      positions: [
        (i * 3.7 + 20) % 100,
        (i * 4.3 + 50) % 100,
        (i * 5.7 + 30) % 100
      ],
      duration: (i % 5) * 2 + 10
    }))
  , []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
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
    <footer className="relative bg-background overflow-hidden">
      {/* Animated Curved Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Waves */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
            backgroundSize: '200% 200%'
          }}
        />

        {/* Floating Particles - Only render after mount to avoid hydration mismatch */}
        {mounted && particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            initial={{
              x: particle.initialX + '%',
              y: particle.initialY + '%'
            }}
            animate={{
              y: particle.positions.map(p => p + '%'),
              x: particle.positions.map(p => (p + 20) % 100 + '%')
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
        ))}

        {/* Curved Wave SVG */}
        <svg
          className="absolute top-0 left-0 w-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ transform: 'translateY(-99%)' }}
        >
          <motion.path
            fill="rgb(var(--background))"
            fillOpacity="1"
            initial={{ d: "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" }}
            animate={{
              d: [
                "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,64L48,74.7C96,85,192,107,288,112C384,117,480,107,576,90.7C672,75,768,53,864,58.7C960,64,1056,96,1152,112C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
        </svg>
      </div>

      {/* Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8">
        {/* Top Section - Newsletter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 sm:mb-16 text-center"
        >
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-4">
            Stay Updated with <span className="text-primary">Godfirst Education and Tours</span>
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Subscribe to our newsletter for exclusive travel deals, education opportunities, and cultural experiences
          </p>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-card border border-border text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                required
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-accent text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Send size={18} />
                <span className="sm:inline">Subscribe</span>
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-8 lg:gap-8 mb-12">
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
                srcSet="https://static.wixstatic.com/media/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png/v1/crop/x_766,y_673,w_3882,h_2984/fill/w_62,h_52,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png 1x, https://static.wixstatic.com/media/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png/v1/crop/x_766,y_673,w_3882,h_2984/fill/w_124,h_104,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png 2x"
                alt="Godfirst Education and Tours"
                className="h-8 sm:h-10 w-auto"
              />
              <span className="text-xl sm:text-2xl font-bold text-foreground">Godfirst Education and Tours</span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-sm">
              Your trusted partner for educational excellence and unforgettable travel experiences across Ghana and beyond.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-secondary mt-0.5 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Jah Love Junction, Kwashieman, Accra, Ghana
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-muted-foreground">0558735654</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-muted-foreground">0537579919</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground break-all">info@godfirstedu.com</span>
              </div>
            </div>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Destinations Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Destinations</h4>
            <ul className="space-y-2">
              {footerLinks.destinations.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Social Media & Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-6 sm:pt-8 border-t border-border"
        >
          {/* Social Links & Theme Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary transition-all"
                >
                  <social.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                </motion.a>
              ))}
              <div className="ml-2">
                <ThemeToggle />
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              {footerLinks.legal.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-xs sm:text-sm text-muted-foreground px-4">
            <p className="mb-1 sm:mb-2">© {new Date().getFullYear()} Godfirst Education and Tours. All rights reserved.</p>
            <p>Made with ❤️ in Ghana</p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
    </footer>
  );
}
