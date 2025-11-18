'use client';

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import ChromaGrid, { ChromaItem } from '../components/ChromaGrid';
import Counter from '../components/Counter';
import Shuffle from '../components/Shuffle';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Globe,
  Heart,
  MapPin,
  GraduationCap,
  Plane,
  Target,
  Lightbulb,
  HandshakeIcon
} from 'lucide-react';

export default function StaffPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640 ? 36 : 48;
    }
    return 48;
  });

  useEffect(() => {
    if (!isMounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMounted(true);
    }

    const updateFontSize = () => {
      setFontSize(window.innerWidth < 640 ? 36 : 48);
    };

    window.addEventListener('resize', updateFontSize);
    return () => {
      window.removeEventListener('resize', updateFontSize);
    };
  }, [isMounted]);
  const teamMembers: ChromaItem[] = [
    {
      image: 'https://static.wixstatic.com/media/10e97e_c2be8d8a0f5449eca586c0a566a7139a~mv2.jpg/v1/fill/w_408,h_480,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/10e97e_c2be8d8a0f5449eca586c0a566a7139a~mv2.jpg" alt="Untitled design1233.jpg',
      title: 'Godfred Nsiah Boamah',
      subtitle: 'CEO/Managing Director',
      handle: '@kwamemensah',
      location: 'Accra, Ghana',
      borderColor: '#10B981',
      gradient: 'linear-gradient(195deg, #10B981, rgb(var(--card)))',
    },
    {
      image: 'https://static.wixstatic.com/media/10e97e_104dab28520347f4b5fe4acac04ec9e2~mv2.jpg/v1/fill/w_408,h_600,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/10e97e_104dab28520347f4b5fe4acac04ec9e2~mv2.jpg',
      title: 'Maxwell Williams',
      subtitle: 'Marketing/Project Manager',
      handle: '@amaasante',
      location: 'Kumasi, Ghana',
      borderColor: 'rgb(var(--secondary))',
      gradient: 'linear-gradient(210deg, rgb(var(--secondary)), rgb(var(--card)))',
    },
    {
      image: 'https://static.wixstatic.com/media/10e97e_e637c99ae9694463b9e13a3f39f48d73~mv2.png/v1/fill/w_408,h_480,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/10e97e_e637c99ae9694463b9e13a3f39f48d73~mv2.png',
      title: 'Godsway Gbologah',
      subtitle: 'Secretary',
      handle: '@kofiagyeman',
      location: 'Cape Coast, Ghana',
      borderColor: 'rgb(var(--accent))',
      gradient: 'linear-gradient(165deg, rgb(var(--accent)), rgb(var(--card)))',
    },
    // {
    //   image: 'https://i.pravatar.cc/300?img=45',
    //   title: 'Abena Owusu',
    //   subtitle: 'Student Affairs Manager',
    //   handle: '@abenaowusu',
    //   location: 'Accra, Ghana',
    //   borderColor: '#10B981',
    //   gradient: 'linear-gradient(195deg, #10B981, rgb(var(--card)))',
    // },
    // {
    //   image: 'https://i.pravatar.cc/300?img=15',
    //   title: 'Yaw Boateng',
    //   subtitle: 'Tour Guide Coordinator',
    //   handle: '@yawboateng',
    //   location: 'Volta Region, Ghana',
    //   borderColor: '#8B5CF6',
    //   gradient: 'linear-gradient(225deg, #8B5CF6, rgb(var(--card)))',
    // },
    // {
    //   image: 'https://i.pravatar.cc/300?img=44',
    //   title: 'Akosua Adjei',
    //   subtitle: 'Marketing Director',
    //   handle: '@akosuaadjei',
    //   location: 'Accra, Ghana',
    //   borderColor: '#F59E0B',
    //   gradient: 'linear-gradient(135deg, #F59E0B, rgb(var(--card)))',
    // },
    // {
    //   image: 'https://i.pravatar.cc/300?img=52',
    //   title: 'Emmanuel Osei',
    //   subtitle: 'Operations Manager',
    //   handle: '@emmanuelosei',
    //   location: 'Takoradi, Ghana',
    //   borderColor: '#EF4444',
    //   gradient: 'linear-gradient(175deg, #EF4444, rgb(var(--card)))',
    // },
    // {
    //   image: 'https://i.pravatar.cc/300?img=26',
    //   title: 'Efua Mensah',
    //   subtitle: 'Customer Relations Lead',
    //   handle: '@efuamensah',
    //   location: 'Accra, Ghana',
    //   borderColor: '#06B6D4',
    //   gradient: 'linear-gradient(155deg, #06B6D4, rgb(var(--card)))',
    // },
    // {
    //   image: 'https://i.pravatar.cc/300?img=59',
    //   title: 'Kwabena Nkrumah',
    //   subtitle: 'Cultural Heritage Expert',
    //   handle: '@kwabenankrumah',
    //   location: 'Kumasi, Ghana',
    //   borderColor: '#EC4899',
    //   gradient: 'linear-gradient(185deg, #EC4899, rgb(var(--card)))',
    // },
  ];

  const [teamCount] = useState(52);
  const [yearsExp] = useState(17);
  const [clientCount] = useState(5247);
  const [satisfactionRate] = useState(99);

  const stats = [
    {
      icon: Users,
      value: teamCount,
      label: 'Team Members',
      description: 'Dedicated professionals',
      suffix: ''
    },
    {
      icon: Award,
      value: yearsExp,
      label: 'Years Experience',
      description: 'In tourism & education',
      suffix: ''
    },
    {
      icon: Globe,
      value: clientCount,
      label: 'Happy Clients',
      description: 'Worldwide travelers',
      suffix: ''
    },
    {
      icon: Heart,
      value: satisfactionRate,
      label: 'Satisfaction',
      description: 'Client satisfaction rate',
      suffix: '%'
    }
  ];

  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for excellence in every tour and educational program we deliver.'
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Our team is passionate about sharing Ghana\'s rich culture and heritage with the world.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We constantly innovate to provide unique and memorable experiences for our clients.'
    },
    {
      icon: HandshakeIcon,
      title: 'Integrity',
      description: 'We operate with complete transparency and integrity in all our dealings.'
    },
    {
      icon: Users,
      title: 'Teamwork',
      description: 'Collaboration and unity drive our success in delivering exceptional experiences.'
    },
    {
      icon: Globe,
      title: 'Cultural Respect',
      description: 'We honor and celebrate the diverse cultures and traditions we encounter.'
    },
    {
      icon: Award,
      title: 'Quality',
      description: 'Premium service and attention to detail in everything we do for our clients.'
    },
    {
      icon: MapPin,
      title: 'Authenticity',
      description: 'We provide genuine, authentic experiences that connect travelers with real Ghana.'
    }
  ];

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
                <Users className="w-5 h-5 text-primary" />
                <Shuffle
                  text="Meet Our Team"
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
                  text="The People Behind Your"
                  tag="h1"
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground !text-4xl sm:!text-5xl md:!text-6xl lg:!text-7xl !normal-case"
                  style={{ fontFamily: 'inherit' }}
                  duration={0.5}
                  stagger={0.03}
                  threshold={0.3}
                />
                <div className="block mt-2">
                  <Shuffle
                    text="Amazing Journey"
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
                Our dedicated team of professionals is committed to providing you with unforgettable travel experiences
                and exceptional educational opportunities across Ghana and beyond.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section with Counter */}
        <section className="py-12 sm:py-16 bg-card border-y border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2 h-[60px] sm:h-[72px]">
                    <div className="overflow-hidden">
                      <Counter
                        value={isMounted ? stat.value : 0}
                        fontSize={fontSize}
                        padding={4}
                        places={stat.value >= 1000 ? [1000, 100, 10, 1] : stat.value >= 100 ? [100, 10, 1] : [10, 1]}
                        textColor="rgb(var(--foreground))"
                        fontWeight="900"
                        containerStyle={{
                          display: 'inline-block'
                        }}
                        counterStyle={{
                          gap: 4,
                          overflow: 'hidden'
                        }}
                        digitStyle={{
                          overflow: 'hidden'
                        }}
                        gradientFrom="rgb(var(--card))"
                        gradientTo="transparent"
                        gradientHeight={16}
                      />
                    </div>
                    {stat.suffix && (
                      <span className="text-4xl sm:text-5xl font-black text-foreground">
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Members Section with ChromaGrid */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Our Expert Team
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Meet the passionate individuals who make every journey and educational experience exceptional
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="min-h-[800px]"
            >
              <ChromaGrid
              className='pt-8'
                items={teamMembers}
                radius={350}
                damping={0.5}
                fadeOut={0.7}
              />
            </motion.div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Our Core Values
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.08,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{
                    y: -15,
                    scale: 1.08,
                    rotateY: 8,
                    rotateX: 8,
                    transition: {
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300
                    }
                  }}
                  className="relative bg-background border-2 border-border rounded-2xl p-6 text-center overflow-hidden group cursor-pointer"
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px'
                  }}
                >
                  {/* Animated gradient background */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    initial={{
                      background: 'linear-gradient(135deg, transparent 0%, transparent 100%)'
                    }}
                    whileHover={{
                      background: [
                        'linear-gradient(135deg, rgba(var(--primary), 0.05) 0%, rgba(var(--secondary), 0.05) 100%)',
                        'linear-gradient(225deg, rgba(var(--secondary), 0.1) 0%, rgba(var(--primary), 0.1) 100%)',
                        'linear-gradient(315deg, rgba(var(--primary), 0.15) 0%, rgba(var(--secondary), 0.15) 100%)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />

                  {/* Floating particles effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(var(--primary), 0.1) 0%, transparent 70%)'
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />

                  {/* Border animation */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    initial={{ borderColor: 'rgb(var(--border))' }}
                    whileHover={{
                      borderColor: ['rgb(var(--primary))', 'rgb(var(--secondary))', 'rgb(var(--primary))'],
                      boxShadow: [
                        '0 0 0 0 rgba(var(--primary), 0)',
                        '0 0 20px 5px rgba(var(--primary), 0.3)',
                        '0 0 40px 10px rgba(var(--secondary), 0.2)',
                        '0 0 20px 5px rgba(var(--primary), 0.3)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ border: '2px solid', pointerEvents: 'none' }}
                  />

                  <div className="relative z-10">
                    <motion.div
                      className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-all duration-300 relative overflow-hidden"
                      initial={{ scale: 1 }}
                      whileHover={{
                        rotate: [0, 360],
                        scale: [1, 1.15, 1.1],
                      }}
                      transition={{
                        rotate: { duration: 0.8, ease: "easeInOut" },
                        scale: { duration: 0.3 }
                      }}
                    >
                      {/* Icon pulse effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        animate={{
                          y: [0, -3, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.1
                        }}
                      >
                        <value.icon className="w-10 h-10 text-primary relative z-10 drop-shadow-lg" />
                      </motion.div>
                    </motion.div>

                    <motion.h3
                      className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300"
                      whileHover={{
                        scale: 1.05,
                        textShadow: "0 0 8px rgba(var(--primary), 0.5)"
                      }}
                    >
                      {value.title}
                    </motion.h3>

                    <motion.p
                      className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300"
                      initial={{ opacity: 0.8 }}
                      whileHover={{
                        opacity: 1,
                        scale: 1.02
                      }}
                    >
                      {value.description}
                    </motion.p>
                  </div>

                  {/* Corner accents */}
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/0 via-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0, rotate: -45 }}
                    whileHover={{
                      scale: 1,
                      rotate: 0,
                      transition: { duration: 0.4 }
                    }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-secondary/0 via-secondary/10 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100"
                    initial={{ scale: 0, rotate: 45 }}
                    whileHover={{
                      scale: 1,
                      rotate: 0,
                      transition: { duration: 0.4 }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Our Team CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: 'radial-gradient(circle at 30% 50%, rgba(var(--primary), 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(var(--secondary), 0.15) 0%, transparent 50%)'
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%']
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full mb-6">
                <Plane className="w-5 h-5 text-secondary" />
                <span className="text-sm font-semibold text-secondary">We&apos;re Hiring</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
                Join Our Growing Team
              </h2>

              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Are you passionate about travel, education, and cultural exchange? We&apos;re always looking for
                talented individuals to join our mission of creating unforgettable experiences.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary hover:bg-accent text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-5 h-5" />
                  View Open Positions
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-card hover:bg-muted border-2 border-border hover:border-primary text-foreground font-bold rounded-full transition-all flex items-center justify-center gap-2"
                >
                  <MapPin className="w-5 h-5" />
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
