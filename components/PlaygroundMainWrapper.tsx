'use client';

import React from 'react';
import { usePlayground } from './PlaygroundContext';

interface PlaygroundMainWrapperProps {
  children: React.ReactNode;
}

export default function PlaygroundMainWrapper({ children }: PlaygroundMainWrapperProps) {
  const { isOpen } = usePlayground();

  return (
    <main
      className={`
        relative
        min-w-0
        flex-1
        overflow-x-clip
        bg-[#09090b]
        transition-all
        duration-500
        ease-out
        ${isOpen ? 'lg:pr-[48%] xl:pr-[45%]' : ''}
      `}
    >
      {children}
    </main>
  );
}
