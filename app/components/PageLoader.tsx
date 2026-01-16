'use client';

import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';

interface PageLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function PageLoader({
  size = 'md',
  text = 'Loading...',
  fullScreen = false
}: PageLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center min-h-[calc(100vh-200px)]';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated Flight Icon */}
        <motion.div
          className="relative"
          animate={{
            y: [0, -10, 0],
            x: [0, 8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Plane
            className={`${sizeClasses[size]} text-primary drop-shadow-lg`}
            fill="currentColor"
          />
          {/* Flight trail */}
          <motion.div
            className="absolute top-1/2 -left-8 w-12 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-primary/60"
            animate={{
              opacity: [0, 0.8, 0],
              scaleX: [0, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Loading text */}
        {text && (
          <motion.p
            className="text-sm text-muted-foreground font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {text}
          </motion.p>
        )}
      </div>
    </div>
  );
}
