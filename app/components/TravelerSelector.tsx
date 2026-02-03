'use client';

import { useState, useRef, useEffect } from 'react';
import { Users, Plus, Minus, Info, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TravelerSelectorProps {
  adults: number;
  children?: number;
  infants?: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange?: (value: number) => void;
  onInfantsChange?: (value: number) => void;
  showChildren?: boolean;
  showInfants?: boolean;
  maxTotal?: number;
  label?: string;
  icon?: any;
  className?: string;
}

export default function TravelerSelector({
  adults,
  children = 0,
  infants = 0,
  onAdultsChange,
  onChildrenChange,
  onInfantsChange,
  showChildren = true,
  showInfants = true,
  maxTotal = 9,
  label = 'Travelers',
  icon: Icon = Users,
  className = '',
}: TravelerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const total = adults + children + infants;

  // Calculate available space and position dropdown accordingly
  useEffect(() => {
    const calculatePosition = () => {
      if (isOpen && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Check available space below (distance from trigger bottom to viewport bottom)
        const spaceBelow = viewportHeight - containerRect.bottom;
        const estimatedDropdownHeight = 450; // Max height approximately

        // If not enough space below, and more space above, flip to top
        if (spaceBelow < estimatedDropdownHeight && containerRect.top > spaceBelow) {
          setDropdownPosition('top');
        } else {
          setDropdownPosition('bottom');
        }
      }
    };

    if (isOpen) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      // capture scroll to keep it relative
      window.addEventListener('scroll', calculatePosition, true);
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getTravelerLabel = () => {
    const parts = [];
    if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
    if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? 's' : ''}`);
    return parts.join(', ') || 'Select Travelers';
  };

  const increment = (type: 'adults' | 'children' | 'infants') => {
    if (total >= maxTotal) return;

    switch (type) {
      case 'adults':
        if (adults < 9) onAdultsChange(adults + 1);
        break;
      case 'children':
        if (onChildrenChange && children < 8) onChildrenChange(children + 1);
        break;
      case 'infants':
        if (onInfantsChange && infants < adults) onInfantsChange(infants + 1);
        break;
    }
  };

  const decrement = (type: 'adults' | 'children' | 'infants') => {
    switch (type) {
      case 'adults':
        if (adults > 1) {
          onAdultsChange(adults - 1);
          if (onInfantsChange && infants >= adults) {
            onInfantsChange(Math.max(0, adults - 1));
          }
        }
        break;
      case 'children':
        if (onChildrenChange && children > 0) onChildrenChange(children - 1);
        break;
      case 'infants':
        if (onInfantsChange && infants > 0) onInfantsChange(infants - 1);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
        <Icon className="w-4 h-4 text-primary" />
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all text-left flex items-center justify-between shadow-sm active:scale-[0.99] ${isOpen ? 'border-primary ring-4 ring-primary/10' : 'border-border bg-background hover:border-primary/50'
          }`}
      >
        <span className="font-semibold text-foreground">{getTravelerLabel()}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              ref={dropdownRef}
              initial={{
                opacity: 0,
                y: dropdownPosition === 'bottom' ? 10 : -10,
                scale: 0.95,
                transformOrigin: dropdownPosition === 'bottom' ? 'top' : 'bottom'
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }}
              exit={{
                opacity: 0,
                y: dropdownPosition === 'bottom' ? 10 : -10,
                scale: 0.95
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`absolute z-50 ${dropdownPosition === 'bottom' ? 'top-full mt-3' : 'bottom-full mb-3'
                } left-0 w-full sm:min-w-[340px] sm:left-auto sm:right-0 bg-card backdrop-blur-xl border-2 border-primary/20 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-6 space-y-6`}
            >
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground">Adults</h3>
                  <p className="text-xs text-muted-foreground">Age 12+</p>
                </div>
                <div className="flex items-center gap-4 bg-muted/40 p-1.5 rounded-full border border-border">
                  <button
                    type="button"
                    onClick={() => decrement('adults')}
                    disabled={adults <= 1}
                    className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-30 shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-bold text-foreground text-lg">{adults}</span>
                  <button
                    type="button"
                    onClick={() => increment('adults')}
                    disabled={adults >= 9 || total >= maxTotal}
                    className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-30 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              {showChildren && onChildrenChange && (
                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">Children</h3>
                    <p className="text-xs text-muted-foreground">Age 2-11</p>
                  </div>
                  <div className="flex items-center gap-4 bg-muted/40 p-1.5 rounded-full border border-border">
                    <button
                      type="button"
                      onClick={() => decrement('children')}
                      disabled={children <= 0}
                      className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-30 shadow-sm"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-foreground text-lg">{children}</span>
                    <button
                      type="button"
                      onClick={() => increment('children')}
                      disabled={children >= 8 || total >= maxTotal}
                      className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-30 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Infants */}
              {showInfants && onInfantsChange && (
                <div className="pt-4 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground">Infants</h3>
                      <p className="text-xs text-muted-foreground">Under 2 years</p>
                    </div>
                    <div className="flex items-center gap-4 bg-muted/40 p-1.5 rounded-full border border-border">
                      <button
                        type="button"
                        onClick={() => decrement('infants')}
                        disabled={infants <= 0}
                        className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-30 shadow-sm"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-bold text-foreground text-lg">{infants}</span>
                      <button
                        type="button"
                        onClick={() => increment('infants')}
                        disabled={infants >= adults || total >= maxTotal}
                        className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all disabled:opacity-30 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {infants > 0 && (
                    <div className="mt-3 flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Infants must sit on an adult's lap (1 infant per adult)
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t-2 border-border space-y-4">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-muted-foreground text-sm uppercase tracking-widest">Total Travelers</span>
                  <span className="text-primary text-xl">{total}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  Apply Selection
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
