'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

interface CustomWindow {
  lenis?: Lenis;
}

export default function GSAPInitializer() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // 2. Initialize Ultra-Smooth Scrolling (Lenis)
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.5,
    });

    // Synchronize Lenis scrolling events with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Run Lenis in the GSAP high-performance ticker loop
    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    // Make lenis globally accessible for click events
    ((window as unknown) as CustomWindow).lenis = lenis;

    let moveCursorHandler: ((e: MouseEvent) => void) | null = null;

    // 3. Setup GSAP context for strict page-specific animation cleaning
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;

      // ==========================================
      // A. LIQUID DYNAMIC CURSOR HALO (BREATHING AURA)
      // ==========================================
      if (!isMobile && cursorRef.current && cursorGlowRef.current) {
        const cursor = cursorRef.current;
        const cursorGlow = cursorGlowRef.current;

        gsap.set([cursor, cursorGlow], { xPercent: -50, yPercent: -50 });

        const moveCursor = (e: MouseEvent) => {
          // Responsive quick point dot
          gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: 'power2.out',
          });

          // Liquid organic tailing glow
          gsap.to(cursorGlow, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.8,
            ease: 'power3.out',
          });
        };

        moveCursorHandler = moveCursor;
        window.addEventListener('mousemove', moveCursor);

        // Breathing animation for the aura
        gsap.to(cursorGlow, {
          scale: 1.15,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        // Hover morphs on buttons, inputs, anchor links
        const hoverables = document.querySelectorAll(
          'a, button, [role="button"], .gsap-hoverable, input, select',
        );

        hoverables.forEach((el) => {
          el.addEventListener('mouseenter', () => {
            gsap.to(cursor, {
              scale: 1.8,
              backgroundColor: 'rgba(16, 185, 129, 0.25)',
              borderColor: '#10b981',
              duration: 0.25,
            });
            gsap.to(cursorGlow, {
              scale: 1.4,
              opacity: 0.18,
              backgroundColor: 'rgba(52, 211, 153, 0.12)',
              duration: 0.35,
            });
          });

          el.addEventListener('mouseleave', () => {
            gsap.to(cursor, {
              scale: 1,
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              borderColor: 'rgba(52, 211, 153, 0.3)',
              duration: 0.25,
            });
            gsap.to(cursorGlow, {
              scale: 1,
              opacity: 0.08,
              backgroundColor: 'rgba(52, 211, 153, 0.08)',
              duration: 0.35,
            });
          });
        });
      }

      // ==========================================
      // B. PAGE INTRO / HERO EASE-IN REVEALS
      // ==========================================
      if (document.querySelector('.gsap-hero-badge')) {
        gsap.fromTo(
          '.gsap-hero-badge',
          { opacity: 0, y: -25, scale: 0.93 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.6)', delay: 0.15 },
        );
      }

      // Elegantly translate + rotate letters upward for maximum eye-candy
      if (document.querySelector('.gsap-hero-title')) {
        gsap.fromTo(
          '.gsap-hero-title',
          { opacity: 0, y: 40, skewY: 3, rotateX: -8, transformPerspective: 1000 },
          {
            opacity: 1,
            y: 0,
            skewY: 0,
            rotateX: 0,
            duration: 1.1,
            ease: 'power4.out',
            delay: 0.25,
          },
        );
      }

      if (document.querySelector('.gsap-hero-desc')) {
        gsap.fromTo(
          '.gsap-hero-desc',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.45 },
        );
      }

      // ==========================================
      // C. CARD STAGGERED ENTRANCES (DASHBOARD STATS)
      // ==========================================
      if (document.querySelector('.gsap-stat-card')) {
        gsap.fromTo(
          '.gsap-stat-card',
          { opacity: 0, y: 25, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.55,
          },
        );
      }

      // ==========================================
      // D. FILTER PILLS REVEAL
      // ==========================================
      if (document.querySelector('.gsap-filter-pill')) {
        gsap.fromTo(
          '.gsap-filter-pill',
          { opacity: 0, x: -12, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.65,
          },
        );
      }

      // ==========================================
      // E. MAGNETIC PHYSICS PHYSICS FOR TARGETS
      // ==========================================
      const magneticElements = document.querySelectorAll('.gsap-magnetic');
      magneticElements.forEach((el) => {
        const trigger = el as HTMLElement;

        const handleMouseMove = (e: MouseEvent) => {
          const rect = trigger.getBoundingClientRect();
          const relX = e.clientX - rect.left - rect.width / 2;
          const relY = e.clientY - rect.top - rect.height / 2;

          gsap.to(trigger, {
            x: relX * 0.4,
            y: relY * 0.4,
            duration: 0.35,
            ease: 'power2.out',
          });
        };

        const handleMouseLeave = () => {
          gsap.to(trigger, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: 'elastic.out(1, 0.45)',
          });
        };

        trigger.addEventListener('mousemove', handleMouseMove);
        trigger.addEventListener('mouseleave', handleMouseLeave);
      });

      // ==========================================
      // F. HIGH-END 3D PERSPECTIVE SCROLL REVEALS
      // ==========================================
      const scrollItems = document.querySelectorAll('.gsap-scroll-reveal');
      scrollItems.forEach((item) => {
        gsap.fromTo(
          item,
          {
            opacity: 0,
            y: 35,
            scale: 0.98,
            transformPerspective: 1000,
            rotateX: -4,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 1.0,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        );
      });

      // Specialized entrance reveal for code blocks
      const codeBlocks = document.querySelectorAll('pre');
      codeBlocks.forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 20, scale: 0.98, transformPerspective: 800, rotateX: -3 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: block,
              start: 'top 93%',
              toggleActions: 'play none none none',
            },
          },
        );
      });

      // ==========================================
      // G. FLOATING BACKDROP LIGHT ORBITS
      // ==========================================
      if (document.querySelector('.gsap-ambient-glow-1')) {
        gsap.to('.gsap-ambient-glow-1', {
          x: '+=45',
          y: '-=30',
          duration: 16,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      if (document.querySelector('.gsap-ambient-glow-2')) {
        gsap.to('.gsap-ambient-glow-2', {
          x: '-=50',
          y: '+=40',
          duration: 20,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // ==========================================
      // H. DOCUMENT READING PROGRESS BAR
      // ==========================================
      const readingBar = document.querySelector('.gsap-reading-progress');
      if (readingBar) {
        gsap.to(readingBar, {
          width: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: 'article',
            start: 'top 14%',
            end: 'bottom 90%',
            scrub: 0.15,
          },
        });
      }

      // ==========================================
      // I. SIDEBAR LINKS ENTRANCE STAGGER
      // ==========================================
      const sidebarLinks = document.querySelectorAll('aside nav a');
      if (sidebarLinks.length > 0) {
        gsap.fromTo(
          sidebarLinks,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            stagger: 0.02,
            ease: 'power3.out',
            delay: 0.35,
          },
        );
      }

      // ==========================================
      // J. ACTIVE TABLE OF CONTENTS SPOTLIGHT
      // ==========================================
      const articleHeadings = document.querySelectorAll('article h2');
      articleHeadings.forEach((heading) => {
        const id = heading.getAttribute('id');
        if (!id) return;

        const tocLink = document.querySelector(`.gsap-toc-link[href="#${id}"]`);
        if (!tocLink) return;

        ScrollTrigger.create({
          trigger: heading,
          start: 'top 150px',
          end: 'bottom 150px',
          onToggle: (self) => {
            if (self.isActive) {
              gsap.to(tocLink, {
                color: '#10b981', // emerald-500
                scale: 1.05,
                fontWeight: '700',
                x: 6,
                duration: 0.3,
                ease: 'power2.out',
              });
            } else {
              gsap.to(tocLink, {
                color: '#a1a1aa', // zinc-400
                scale: 1.0,
                fontWeight: '500',
                x: 0,
                duration: 0.3,
                ease: 'power2.out',
              });
            }
          },
        });
      });

      // Smooth scrolling on clicking TOC links via Lenis
      const tocLinks = document.querySelectorAll('.gsap-toc-link');
      tocLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href');
          const globalWindow = (window as unknown) as CustomWindow;
          if (targetId && globalWindow.lenis) {
            // Safe resolution using getElementById to avoid querySelector CSS restrictions
            const targetElement = document.getElementById(targetId.replace('#', ''));
            if (targetElement) {
              globalWindow.lenis.scrollTo(targetElement, {
                offset: -100,
                duration: 1.2,
                easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              });
            }
          }
        });
      });
    });

    // Refresh calculations and dimensions after Next.js layout transition settle
    const refreshTimer = setTimeout(() => {
      lenis.resize();
      ScrollTrigger.refresh();
      // Instantly scroll window to top on page change
      lenis.scrollTo(0, { immediate: true });
    }, 150);

    return () => {
      // Clean up window mouse listeners to avoid memory leaks or cursor stutter
      if (moveCursorHandler) {
        window.removeEventListener('mousemove', moveCursorHandler);
      }
      clearTimeout(refreshTimer);
      delete ((window as unknown) as CustomWindow).lenis;
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      ctx.revert();
    };
  }, [pathname]);

  return (
    <>
      {/* Eye-soothing trailing dot */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/40 bg-emerald-500/20 shadow-[0_0_8px_rgba(52,211,153,0.4)] transition-transform lg:block"
      />
      {/* Liquid Breathing aura trail */}
      <div
        ref={cursorGlowRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] hidden h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/8 blur-[50px] transition-transform lg:block"
      />
    </>
  );
}
