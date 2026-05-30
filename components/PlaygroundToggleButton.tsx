'use client';

import React, { useEffect, useRef } from 'react';
import { usePlayground } from './PlaygroundContext';
import { Terminal, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';

export default function PlaygroundToggleButton() {
  const { isOpen, setIsOpen } = usePlayground();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Staggered magnetic hover effect using GSAP
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const onMouseEnter = () => {
      gsap.to(button, {
        scale: 1.08,
        boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to('.toggle-sparkle', {
        rotate: 180,
        scale: 1.2,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    const onMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        boxShadow: '0 0 15px rgba(16, 185, 129, 0.15)',
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to('.toggle-sparkle', {
        rotate: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    button.addEventListener('mouseenter', onMouseEnter);
    button.addEventListener('mouseleave', onMouseLeave);

    // Dynamic initial floating animation
    gsap.fromTo(
      button,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 1.5, ease: 'power4.out' }
    );

    return () => {
      button.removeEventListener('mouseenter', onMouseEnter);
      button.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <button
      ref={buttonRef}
      onClick={() => setIsOpen(!isOpen)}
      className="fixed bottom-6 right-6 z-40 flex h-12 items-center gap-2 rounded-full border border-emerald-500/30 bg-[#09090b]/90 px-4 text-xs font-bold uppercase tracking-wider text-emerald-400 shadow-lg shadow-emerald-500/10 backdrop-blur-md transition-colors hover:bg-emerald-500/10 hover:text-emerald-300 cursor-pointer select-none"
      title={isOpen ? 'Close Code Playground' : 'Open Code Playground'}
    >
      <Terminal className="h-4 w-4" />
      <span>{isOpen ? 'Close Arena' : 'Code Arena'}</span>
      <Sparkles className="toggle-sparkle h-3 w-3 text-emerald-400" />
    </button>
  );
}
