'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ERBuilder from '@/components/ERBuilder/ERBuilder';

export default function ERBuilderPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center font-mono text-zinc-500 text-xs">
        LOADING CORE ENGINE GRAPH...
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#09090b]">
      {/* Global Insignia Header */}
      <Navbar activeModulesCount={12} />
      
      {/* Main Interactive ER Playground */}
      <div className="flex-1 w-full relative overflow-hidden">
        <ERBuilder />
      </div>
    </div>
  );
}
