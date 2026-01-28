'use client';

import { useState } from 'react';
import { Users, Plus, Minus, Info } from 'lucide-react';
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
}: TravelerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const total = adults + children + infants;

  const getTravelerLabel = () => {
    const parts = [];
    if (adults > 0) parts.push(`${adults} Adult${adults > 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
    if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? 's' : ''}`);
    return parts.join(', ') || '0 Travelers';
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
          // If adults decrease below infants, reduce infants
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
    <div className="relative">
      <label className="block text-sm font-medium text-foreground mb-2">
        Travelers
      </label>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span>{getTravelerLabel()}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-20 top-full mt-2 w-full bg-card border-2 border-border rounded-xl shadow-2xl p-4 space-y-4"
            >
              {/* Adults */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Adults</p>
                    <p className="text-xs text-muted-foreground">Age 12+</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => decrement('adults')}
                      disabled={adults <= 1}
                      className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-primary"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-foreground">{adults}</span>
                    <button
                      type="button"
                      onClick={() => increment('adults')}
                      disabled={adults >= 9 || total >= maxTotal}
                      className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-primary"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Children */}
              {showChildren && onChildrenChange && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Children</p>
                      <p className="text-xs text-muted-foreground">Age 2-11</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decrement('children')}
                        disabled={children <= 0}
                        className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-primary"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-foreground">{children}</span>
                      <button
                        type="button"
                        onClick={() => increment('children')}
                        disabled={children >= 8 || total >= maxTotal}
                        className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-primary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Infants */}
              {showInfants && onInfantsChange && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Infants</p>
                      <p className="text-xs text-muted-foreground">Under 2 years</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decrement('infants')}
                        disabled={infants <= 0}
                        className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-primary"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-foreground">{infants}</span>
                      <button
                        type="button"
                        onClick={() => increment('infants')}
                        disabled={infants >= adults || total >= maxTotal}
                        className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:border-primary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {infants > 0 && (
                    <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 mt-2">
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Infants must sit on an adult's lap (1 infant per adult)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Total Summary */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Travelers:</span>
                  <span className="font-bold text-foreground">{total}</span>
                </div>
                {total >= maxTotal && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Maximum {maxTotal} travelers reached
                  </p>
                )}
              </div>

              {/* Done Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
