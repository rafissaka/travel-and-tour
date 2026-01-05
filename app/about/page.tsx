'use client';

import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import {
  GraduationCap,
  Plane,
  Users,
  Heart,
  Target,
  Award,
  Globe,
  BookOpen,
  Compass,
  MapPin,
  Star,
  TrendingUp
} from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const values = [
    {
      icon: Heart,
      title: 'Passion for Excellence',
      description: 'We are committed to delivering exceptional educational and travel experiences that exceed expectations.'
    },
    {
      icon: Users,
      title: 'Customer-Centric',
      description: 'Your dreams and aspirations guide our services. We listen, understand, and deliver personalized solutions.'
    },
    {
      icon: Award,
      title: 'Integrity & Trust',
      description: 'We build lasting relationships through transparency, honesty, and unwavering ethical standards.'
    },
    {
      icon: Globe,
      title: 'Global Perspective',
      description: 'We connect local communities with global opportunities, fostering cultural exchange and understanding.'
    }
  ];

  const services = [
    {
      icon: GraduationCap,
      title: 'Educational Services',
      description: 'Expert guidance for studying abroad, admissions, and academic programs worldwide.',
      color: 'from-blue-500 to-cyan-500',
      href: '/services'
    },
    {
      icon: Plane,
      title: 'Travel & Tours',
      description: 'Unforgettable journeys across Ghana and international destinations with curated experiences.',
      color: 'from-purple-500 to-pink-500',
      href: '/services'
    },
    {
      icon: Compass,
      title: 'Visa Assistance',
      description: 'Comprehensive visa support and documentation services for seamless international travel.',
      color: 'from-orange-500 to-red-500',
      href: '/services'
    },
    {
      icon: BookOpen,
      title: 'Cultural Programs',
      description: 'Immersive cultural experiences connecting travelers with authentic local traditions.',
      color: 'from-green-500 to-emerald-500',
      href: '/services'
    }
  ];

  const stats = [
    { number: '10+', label: 'Years Experience', icon: TrendingUp },
    { number: '2000+', label: 'Happy Clients', icon: Users },
    { number: '50+', label: 'Destinations', icon: MapPin },
    { number: '98%', label: 'Success Rate', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80"
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                About Us
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
            >
              Empowering Dreams Through
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent mt-2"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                Education & Exploration
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              animate={{
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              At Godfirst Education and Tours, we believe in the transformative power of education and travel.
              For over a decade, we&apos;ve been opening doors to global opportunities and unforgettable experiences.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0 opacity-5">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80"
            alt="Travel Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl transform group-hover:scale-105 transition-transform duration-500" />
              <div className="relative p-8 lg:p-10 bg-card/95 backdrop-blur-sm border border-border rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <img
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&q=80"
                    alt="Mission"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="p-4 bg-primary/10 rounded-2xl">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg relative z-10">
                  To provide exceptional educational guidance and travel experiences that broaden horizons,
                  foster cultural understanding, and empower individuals to achieve their dreams. We are
                  committed to excellence, integrity, and personalized service in every journey we facilitate.
                </p>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent rounded-3xl transform group-hover:scale-105 transition-transform duration-500" />
              <div className="relative p-8 lg:p-10 bg-card/95 backdrop-blur-sm border border-border rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                  <img
                    src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&q=80"
                    alt="Vision"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="p-4 bg-secondary/10 rounded-2xl">
                    <Globe className="w-8 h-8 text-secondary" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground">Our Vision</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg relative z-10">
                  To be West Africa&apos;s leading bridge between local aspirations and global opportunities,
                  recognized for transforming lives through education and creating lasting memories through
                  authentic travel experiences that celebrate culture and diversity.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Image Side */}
            <motion.div
              variants={fadeInUp}
              className="relative"
            >
              <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://static.wixstatic.com/media/11062b_f93d5f1509ad41c3a867c2cdbaaa6735~mv2.jpeg/v1/fill/w_400,h_264,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/11062b_f93d5f1509ad41c3a867c2cdbaaa6735~mv2.jpeg"
                  alt="Education and Travel"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <motion.div
                  className="absolute inset-0 bg-linear-to-br from-primary/40 to-secondary/40"
                  animate={{
                    opacity: [0.4, 0.6, 0.4]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/90 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white z-10 px-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, type: 'spring' }}
                      className="inline-block mb-4"
                    >
                      <div className="p-6 bg-white/10 backdrop-blur-md rounded-full">
                        <Globe className="w-16 h-16" />
                      </div>
                    </motion.div>
                    <p className="text-xl font-semibold drop-shadow-lg">Building Dreams Since 2014</p>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-6 -right-6 bg-card border border-border p-6 rounded-2xl shadow-xl"
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-1">10+</div>
                  <div className="text-sm text-muted-foreground">Years of Excellence</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Content Side */}
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Story: A Journey of Passion & Purpose
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2014, Godfirst Education and Tours emerged from a simple yet powerful vision:
                  to make quality education and meaningful travel accessible to everyone. What started as
                  a small consultancy has grown into a trusted partner for thousands of students and travelers.
                </p>
                <p>
                  Our founder recognized the challenges faced by aspiring students seeking international
                  education and travelers yearning for authentic experiences. With determination and a
                  heart for service, we built a company that bridges these gaps with expertise, care, and
                  unwavering commitment.
                </p>
                <p>
                  Today, we proudly serve clients across Ghana and beyond, offering comprehensive educational
                  consulting, visa assistance, and curated travel experiences. Every success story, every
                  satisfied traveler, fuels our passion to do more and reach further.
                </p>
                <p className="font-semibold text-foreground">
                  At Godfirst, your success is our mission, and your journey is our privilege.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Our Core Values
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              The principles that guide everything we do
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="mb-4 inline-block p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              What We Do
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Comprehensive services designed to make your dreams a reality
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6 lg:gap-8"
          >
            {services.map((service, index) => (
              <motion.a
                key={index}
                href={service.href}
                variants={fadeInUp}
                className="group relative bg-card border border-border rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer block"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-linear-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative">
                  <div className="mb-6 inline-flex items-center justify-center p-4 bg-linear-to-br from-primary/10 to-secondary/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">{service.description}</p>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="mt-6 flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all duration-300"
                  >
                    Learn More
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </motion.div>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-linear-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="mb-4 inline-flex items-center justify-center p-4 bg-card border border-border rounded-2xl shadow-lg">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  className="text-4xl md:text-5xl font-bold text-foreground mb-2"
                >
                  {stat.number}
                </motion.div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Our Journey in Pictures
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Moments that define our commitment to excellence
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { url: 'https://images.unsplash.com/photo-1575794887726-b72453e33ced?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGFmcmljY2NhbiUyMFN0dWRlbnRzJTIwY2VsZWJyYXRpbmd8ZW58MHx8MHx8fDA%3D', alt: 'Students celebrating' },
              { url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80', alt: 'Travel adventure' },
              { url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80', alt: 'Cultural experience' },
              { url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&q=80', alt: 'Team collaboration' },
              { url: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&q=80', alt: 'Education guidance' },
              { url: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&q=80', alt: 'Travel destination' },
              { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80', alt: 'Student success' },
              { url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80', alt: 'Scenic travel' },
            ].map((image, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-semibold">{image.alt}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80"
            alt="CTA Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-linear-to-br from-primary/40 via-secondary/40 to-accent/40" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-linear-to-br from-primary via-secondary to-accent p-12 rounded-3xl shadow-2xl backdrop-blur-sm"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Whether you&apos;re pursuing education abroad or planning your next adventure,
              we&apos;re here to make it extraordinary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get in Touch
              </motion.a>
              <motion.a
                href="/services"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
              >
                Explore Services
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
