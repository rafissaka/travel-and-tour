'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from './ThemeToggle';
import {
  Home,
  Users,
  Headphones,
  Info,
  Star,
  Mail,
  BookOpen,
  Plane,
  GraduationCap,
  FileText,
  Edit,
  Briefcase,
  Target,
  Hotel,
  Map,
  Compass,
  Globe,
} from 'lucide-react';

const navLinks = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Our Staff', href: '/our-staff', icon: Users },
  {
    name: 'Services',
    href: '/services',
    icon: Headphones,
    dropdown: [
      { name: 'Family Travel Consultation', href: '/services/family-travel', icon: Users },
      { name: 'Study & Summer Programs Abroad', href: '/services/study-programs', icon: GraduationCap },
      { name: 'International & Domestic Tours', href: '/services/tours', icon: Compass },
      { name: 'Hotel & Flight Reservations', href: '/services/reservations', icon: Hotel },
      { name: 'International Travel & Visa Assistance', href: '/services/visa-assistance', icon: Globe },
      { name: 'Itinerary Planning', href: '/services/itinerary', icon: Map },
    ],
  },
  { name: 'About Us', href: '/about', icon: Info },
  { name: 'Testimonials', href: '/testimonials', icon: Star },
  { name: 'Contact', href: '/contact', icon: Mail },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutside = Object.values(dropdownRefs.current).every(
        (ref) => ref && !ref.contains(target)
      );
      if (isOutside) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-xl shadow-xl shadow-black/10 border-b border-border'
          : 'bg-background/80 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center h-16 md:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0 mr-2 sm:mr-4 lg:mr-16 xl:mr-20">
            <div className="relative">
              <img
                src="https://static.wixstatic.com/media/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png/v1/crop/x_766,y_673,w_3882,h_2984/fill/w_62,h_52,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png"
                srcSet="https://static.wixstatic.com/media/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png/v1/crop/x_766,y_673,w_3882,h_2984/fill/w_62,h_52,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png 1x, https://static.wixstatic.com/media/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png/v1/crop/x_766,y_673,w_3882,h_2984/fill/w_124,h_104,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/10e97e_67e4d7a16b5546c2b9c8a6d5059c2b80~mv2.png 2x"
                alt="Godfirst Education and Tours"
                className="h-10 sm:h-12 w-auto group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm sm:text-lg md:text-xl text-foreground truncate">
                Godfirst Education and Tours
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2 flex-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              const hasDropdown = link.dropdown && link.dropdown.length > 0;

              return (
                <div
                  key={link.href}
                  className="relative"
                  ref={(el) => {
                    if (el) dropdownRefs.current[link.name] = el;
                  }}
                  onMouseEnter={() => {
                    if (hasDropdown) {
                      if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                      }
                      setOpenDropdown(link.name);
                    }
                  }}
                  onMouseLeave={() => {
                    if (hasDropdown) {
                      closeTimeoutRef.current = setTimeout(() => {
                        setOpenDropdown(null);
                      }, 150);
                    }
                  }}
                >
                  <Link
                    href={link.href}
                    className="relative px-3 py-3 xl:px-4 group flex items-center gap-1 whitespace-nowrap"
                  >
                    <span
                      className={`relative z-10 text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    >
                      {link.name}
                    </span>
                    {hasDropdown && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-300 ${
                          openDropdown === link.name ? 'rotate-180' : ''
                        } ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}

                    {/* Animated underline */}
                    <span
                      className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-500 ${
                        isActive
                          ? 'w-4/5 opacity-100'
                          : 'w-0 opacity-0 group-hover:w-4/5 group-hover:opacity-100'
                      }`}
                    />

                    {/* Hover background with gradient */}
                    <span className="absolute inset-0 bg-primary/10 rounded-xl scale-0 group-hover:scale-100 transition-transform duration-300 opacity-0 group-hover:opacity-100" />
                  </Link>

                  {/* Dropdown Menu */}
                  {hasDropdown && (
                    <div
                      className={`absolute top-full left-0 mt-3 w-[600px] bg-background/98 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden transition-all duration-500 origin-top ${
                        openDropdown === link.name
                          ? 'opacity-100 scale-100 translate-y-0'
                          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                      }`}
                    >
                      <div className="p-4 grid grid-cols-2 gap-3">
                        {link.dropdown?.map((item, index) => {
                          const isSubActive = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-500 group/item relative overflow-hidden ${
                                isSubActive
                                  ? 'bg-primary/20 text-primary shadow-lg'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-md'
                              }`}
                              style={{
                                animationDelay: `${index * 50}ms`,
                              }}
                            >
                              {/* Animated background gradient */}
                              <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />

                              {/* Sliding shine effect */}
                              <span className="absolute inset-0 -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                              <span className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-500 shadow-sm group-hover/item:shadow-md shrink-0">
                                <item.icon className="w-4 h-4" />
                              </span>
                              <div className="flex-1 relative min-w-0">
                                <span className="text-sm font-semibold block group-hover/item:translate-x-1 transition-transform duration-300">
                                  {item.name}
                                </span>
                                <span className="text-xs text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">
                                  {index === 0 ? 'Explore' : index === 1 ? 'Discover' : index === 2 ? 'Learn' : 'View'}
                                </span>
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="relative opacity-0 -translate-x-3 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-500 text-primary shrink-0"
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right section - Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-3 sm:space-x-6 shrink-0 ml-auto">
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 sm:p-2.5 rounded-xl hover:bg-muted transition-all duration-300 group text-foreground"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-all duration-500 sm:w-6 sm:h-6 ${
                  isMobileMenuOpen ? 'rotate-90 scale-90' : 'group-hover:scale-110'
                }`}
              >
                {isMobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-6 space-y-3 bg-background/98 backdrop-blur-xl border-t border-border max-h-[calc(100vh-8rem)] overflow-y-auto">
          {navLinks.map((link, index) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const hasDropdown = link.dropdown && link.dropdown.length > 0;
            const isDropdownOpen = mobileOpenDropdown === link.name;

            return (
              <div key={link.href} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={link.href}
                    onClick={() => !hasDropdown && setIsMobileMenuOpen(false)}
                    className={`flex-1 flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-primary/20 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: isMobileMenuOpen
                        ? 'slideInFromRight 0.4s ease-out forwards'
                        : 'none',
                    }}
                  >
                    <span className="font-medium">{link.name}</span>
                    {isActive && !hasDropdown && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </Link>
                  {hasDropdown && (
                    <button
                      onClick={() =>
                        setMobileOpenDropdown(isDropdownOpen ? null : link.name)
                      }
                      className="p-3.5 hover:bg-muted/50 rounded-xl transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-300 ${
                          isDropdownOpen ? 'rotate-180' : ''
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Mobile Dropdown */}
                {hasDropdown && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isDropdownOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="pl-6 space-y-2 py-2">
                      {link.dropdown?.map((item) => {
                        const isSubActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-500 relative overflow-hidden group/mobile ${
                              isSubActive
                                ? 'bg-primary/20 text-primary shadow-lg font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:shadow-md'
                            }`}
                          >
                            {/* Animated background */}
                            <span className="absolute inset-0 bg-primary/10 opacity-0 group-hover/mobile:opacity-100 transition-opacity duration-500" />

                            {/* Shine effect */}
                            <span className="absolute inset-0 -translate-x-full group-hover/mobile:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            <span className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 group-hover/mobile:scale-110 group-hover/mobile:rotate-6 transition-all duration-500">
                              <item.icon className="w-5 h-5" />
                            </span>
                            <span className="text-sm font-medium relative group-hover/mobile:translate-x-1 transition-transform duration-300">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-6 mt-2 border-t border-border/50">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  );
}
