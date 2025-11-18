'use client';

import { motion } from 'framer-motion';
import { Plane, MapPin, Compass, Globe } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Main Loading Content */}
      <div className="relative z-10 w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Globe className="w-16 h-16 sm:w-20 sm:h-20 text-primary" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            God First Education & Tours
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Preparing your journey...
          </p>
        </motion.div>

        {/* Horizontal Loading Bar Container */}
        <div className="relative">
          {/* Background Track */}
          <div className="h-3 sm:h-4 bg-muted rounded-full overflow-hidden relative">
            {/* Animated Gradient Fill */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, rgb(var(--primary)), rgb(var(--secondary)), rgb(var(--accent)))',
                backgroundSize: '200% 100%'
              }}
              animate={{
                backgroundPosition: ['0% 0%', '200% 0%'],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                backgroundPosition: { duration: 1.2, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 1, repeat: Infinity, ease: 'easeInOut' }
              }}
            />

            {/* Moving Shimmer Effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                backgroundSize: '50% 100%'
              }}
              animate={{
                backgroundPosition: ['-50% 0%', '150% 0%']
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            {/* Pulsing Dots */}
            <div className="absolute inset-0 flex items-center justify-around px-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.12,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Animated Travel Icons Moving on Track */}
          <div className="absolute inset-0 flex items-center">
            {/* Flying Plane */}
            <motion.div
              className="absolute"
              animate={{
                x: ['-10%', '110%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
                repeatDelay: 0.2
              }}
            >
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  rotate: [0, -5, 0]
              }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Plane className="w-8 h-8 sm:w-10 sm:h-10 text-primary drop-shadow-lg" fill="currentColor" />
              </motion.div>
            </motion.div>

            {/* Bouncing Compass */}
            <motion.div
              className="absolute"
              animate={{
                x: ['-10%', '110%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
                delay: 0.5,
                repeatDelay: 0.2
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-secondary drop-shadow-lg" />
              </motion.div>
            </motion.div>

            {/* Gliding Map Pin */}
            <motion.div
              className="absolute"
              animate={{
                x: ['-10%', '110%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
                delay: 1,
                repeatDelay: 0.2
              }}
            >
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-accent drop-shadow-lg" fill="currentColor" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Loading Text with Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="text-sm sm:text-base">Loading</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    y: [0, -3, 0]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut'
                  }}
                  className="text-lg sm:text-xl"
                >
                  •
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Progress Percentage (Optional) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4"
        >
          <motion.p
            className="text-xs sm:text-sm text-muted-foreground font-mono"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            Exploring new destinations
          </motion.p>
        </motion.div>

        {/* Fun Travel Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl"
            >
              ✈️
            </motion.span>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Did you know? Ghana has over 100 castles and forts!
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-24 sm:h-32"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <motion.path
            fill="rgb(var(--primary))"
            fillOpacity="0.1"
            animate={{
              d: [
                "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,64L48,74.7C96,85,192,107,288,112C384,117,480,107,576,90.7C672,75,768,53,864,58.7C960,64,1056,96,1152,112C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,144C960,149,1056,139,1152,128C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </svg>
      </div>
    </div>
  );
}
