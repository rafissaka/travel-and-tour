'use client';

import { motion } from 'framer-motion';
import { Plane, Cloud, Stars, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

const PlaneSVG = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CloudIcon = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
    <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: '100vw', opacity: [0, 1, 1, 0] }}
        transition={{
            duration: 20,
            repeat: Infinity,
            delay,
            ease: "linear"
        }}
        className={`absolute pointer-events-none ${className}`}
    >
        <Cloud className="w-16 h-16 text-white/10" fill="currentColor" />
    </motion.div>
);

export default function StandaloneSearchLoading() {
    const [messages, setMessages] = useState([
        "Curating the best travel deals...",
        "Finding direct routes for you...",
        "Comparing hundreds of airlines...",
        "Verifying availability in real-time...",
        "Preparing your premium travel experience..."
    ]);
    const [currentMsg, setCurrentMsg] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentMsg((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [messages.length]);

    return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 flex flex-col items-center justify-center overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-0 w-full">
                    <CloudIcon className="top-10" delay={0} />
                    <CloudIcon className="top-40" delay={5} />
                    <CloudIcon className="top-80" delay={12} />
                </div>

                {/* Animated Stars/Particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0.1, scale: 0.5 }}
                        animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.5, 1, 0.5] }}
                        transition={{
                            duration: Math.random() * 3 + 2,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                        className="absolute rounded-full bg-white"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 text-center px-6">
                {/* Flying Planes Animation */}
                <div className="relative w-64 h-64 mx-auto mb-8">
                    {/* Central Hub */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-20"
                    >
                        <div className="w-40 h-40 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center p-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                            <div className="relative">
                                <p className="text-white font-black text-xl leading-tight tracking-tighter">
                                    GODFIRST
                                </p>
                                <p className="text-amber-400 font-bold text-[10px] uppercase tracking-[0.2em] -mt-1">
                                    Education & Tours
                                </p>
                                <div className="mt-2 h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Orbiting Plane 1 */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 text-white">
                            <PlaneSVG className="w-10 h-10 rotate-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                        </div>
                    </motion.div>

                    {/* Orbiting Plane 2 */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                    >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -mb-4 text-amber-300">
                            <PlaneSVG className="w-8 h-8 -rotate-90 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                        </div>
                    </motion.div>

                    {/* Pulsing Ring */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 rounded-full border-2 border-white/20"
                    />
                </div>

                {/* Loading Text */}
                <motion.div
                    key={currentMsg}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            {messages[currentMsg]}
                        </h2>
                        <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                    </div>

                    {/* Progress Bar */}
                    <div className="w-48 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                        />
                    </div>

                    <p className="text-white/60 text-sm font-medium uppercase tracking-[0.3em]">
                        Searching Global Database
                    </p>
                </motion.div>
            </div>

            {/* Brand Footer */}
            <div className="absolute bottom-10 left-0 w-full flex justify-center opacity-40">
                <div className="flex items-center gap-3">
                    <div className="h-px w-12 bg-white/30" />
                    <span className="text-white text-xs font-bold tracking-[0.5em] uppercase">
                        Godfirst Travel Network
                    </span>
                    <div className="h-px w-12 bg-white/30" />
                </div>
            </div>
        </div>
    );
}
