'use client';

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import Dock from '../components/Dock ';
import Shuffle from '../components/Shuffle';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plane,
  GraduationCap,
  Hotel,
  Map,
  Calendar,
  Globe,
  Heart,
  Compass,
  ArrowRight,
  CheckCircle2,
  Star,
  Loader2
} from 'lucide-react';

interface Service {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  imageUrl: string | null;
  features: string[];
  color: string | null;
  icon?: any;
}

const iconMap: Record<string, any> = {
  Users,
  Plane,
  GraduationCap,
  Hotel,
  Map,
  Globe,
  Compass,
  Calendar
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(0);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services?active=true');
      if (response.ok) {
        const data = await response.json();
        // Map icon names to actual icon components
        const servicesWithIcons = data.map((service: any) => ({
          ...service,
          icon: service.iconName && iconMap[service.iconName] ? iconMap[service.iconName] : Plane,
          features: Array.isArray(service.features) ? service.features : []
        }));
        setServices(servicesWithIcons);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const dockItems = services.map((service, index) => {
    const ServiceIcon = service.icon || Plane;
    return {
      icon: <ServiceIcon className="w-6 h-6 text-white" />,
      label: service.title,
      onClick: () => setSelectedService(index),
      className: selectedService === index ? 'ring-2 ring-primary' : ''
    };
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    );
  }

  if (services.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">No Services Available</h1>
            <p className="text-muted-foreground">Check back later for our services.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 lg:py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.3, 0.5]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6"
              >
                <Plane className="w-5 h-5 text-primary" />
                <Shuffle
                  text="Our Services"
                  tag="span"
                  className="text-sm font-semibold text-primary !text-sm !normal-case"
                  style={{ fontFamily: 'inherit' }}
                  duration={0.4}
                  stagger={0.02}
                  threshold={0.5}
                />
              </motion.div>

              <div className="mb-6">
                <Shuffle
                  text="Comprehensive Travel Solutions"
                  tag="h1"
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground !text-4xl sm:!text-5xl md:!text-6xl lg:!text-7xl !normal-case"
                  style={{ fontFamily: 'inherit' }}
                  duration={0.5}
                  stagger={0.03}
                  threshold={0.3}
                />
                <div className="block mt-2">
                  <Shuffle
                    text="For Every Journey"
                    tag="span"
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black !text-4xl sm:!text-5xl md:!text-6xl lg:!text-7xl !normal-case text-primary"
                    style={{
                      fontFamily: 'inherit'
                    }}
                    duration={0.5}
                    stagger={0.03}
                    threshold={0.3}
                  />
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              >
                From personalized consultations to complete travel arrangements, we offer everything you need
                to make your journey unforgettable.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Featured Service Showcase */}
        <section className="py-16 sm:py-20 lg:py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              key={selectedService}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl overflow-hidden bg-card border-2 border-border shadow-2xl"
            >
              <div className="grid md:grid-cols-2 gap-8">
                {/* Image Side */}
                <motion.div
                  className="relative h-[400px] md:h-auto overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={services[selectedService].imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'}
                    alt={services[selectedService].title}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `linear-gradient(135deg, ${services[selectedService].color || '#10B981'}40, transparent)`
                    }}
                  />
                </motion.div>

                {/* Content Side */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {services[selectedService].tagline && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                        {(() => {
                          const ServiceIcon = services[selectedService].icon || Plane;
                          return <ServiceIcon className="w-4 h-4" />;
                        })()}
                        {services[selectedService].tagline}
                      </div>
                    )}

                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                      {services[selectedService].title}
                    </h2>

                    <p className="text-lg text-muted-foreground mb-6">
                      {services[selectedService].description}
                    </p>

                    {services[selectedService].features && services[selectedService].features.length > 0 && (
                      <div className="space-y-3 mb-8">
                        {services[selectedService].features.slice(0, 4).map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + idx * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <CheckCircle2
                              className="w-5 h-5 flex-shrink-0"
                              style={{ color: services[selectedService].color || '#10B981' }}
                            />
                            <span className="text-foreground">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <Link href={`/services/${services[selectedService].slug}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-primary hover:bg-accent text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        Learn More
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 sm:py-20 lg:py-24 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                All Our Services
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our comprehensive range of travel and educational services
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => {
                const ServiceIcon = service.icon || Plane;
                return (
                  <Link key={service.id} href={`/services/${service.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{
                        y: -10,
                        scale: 1.02
                      }}
                      className="group relative bg-background border-2 border-border rounded-2xl overflow-hidden cursor-pointer h-full"
                      onClick={() => setSelectedService(index)}
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={service.imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop'}
                          alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div
                          className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
                          style={{
                            background: `linear-gradient(180deg, transparent, ${service.color || '#10B981'}80)`
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${service.color || '#10B981'}20` }}
                          >
                            <ServiceIcon className="w-6 h-6" style={{ color: service.color || '#10B981' }} />
                          </div>
                          {service.tagline && (
                            <div className="text-xs font-bold text-primary">{service.tagline}</div>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {service.description}
                        </p>

                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                          View Details
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {selectedService === index && (
                        <motion.div
                          layoutId="selected-service"
                          className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Why Choose Us
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the difference with our dedicated service and expertise
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Star,
                  title: '17+ Years Experience',
                  description: 'Trusted expertise in travel and education services'
                },
                {
                  icon: Heart,
                  title: '99% Satisfaction Rate',
                  description: 'Our clients love the experiences we create'
                },
                {
                  icon: Globe,
                  title: 'Global Network',
                  description: 'Partnerships worldwide for seamless service'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-8 bg-card rounded-2xl border border-border"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Dock Navigation - Hidden on small screens to avoid covering chat button */}
        <div className="hidden md:block fixed bottom-0 left-0 right-0 z-50 pb-4">
          <Dock items={dockItems} />
        </div>
      </main>
      <Footer />
    </>
  );
}
