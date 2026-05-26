'use client';

import { motion } from 'framer-motion';
import { ArrowRight, FileCode, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Doc {
  slug: string;
  title: string;
  description: string;
  category: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 140, damping: 18 },
  },
} as const;

export default function AnimatedGrid({ docs }: { docs: Doc[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
    >
      {docs.map((doc) => (
        <motion.div
          key={doc.slug}
          variants={cardVariants}
          whileHover={{ y: -6 }}
          className="group relative rounded-2xl bg-[#0d0d11]/40 border border-white/[0.05] p-7 transition-all duration-300 hover:border-emerald-500/30 hover:bg-[#0e1616]/40 hover:shadow-[0_20px_50px_rgba(16,185,129,0.06)]"
        >
          {/* Subtle Back Glow Effect */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-emerald-500/0 via-teal-500/0 to-emerald-500/0 opacity-0 group-hover:opacity-100 group-hover:from-emerald-500/10 group-hover:via-teal-500/5 group-hover:to-emerald-500/0 transition-all duration-500 blur-sm pointer-events-none" />

          <Link href={`/docs/${doc.slug}`} className="flex flex-col h-full justify-between space-y-6 relative z-10">
            <div className="space-y-4.5">
              {/* Top Row: Category pill & Arrow link */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/5 group-hover:border-emerald-500/20 transition-all duration-300">
                    <FileCode className="h-5 w-5" />
                  </div>
                  
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5 group-hover:text-emerald-300 transition-all duration-300">
                    <Sparkles className="h-2.5 w-2.5 text-emerald-400 group-hover:animate-pulse" />
                    {doc.category}
                  </span>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.02] border border-white/[0.05] group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all duration-300">
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-400 transform group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-300 transition-all duration-300 leading-snug">
                {doc.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                {doc.description}
              </p>
            </div>

            {/* Bottom Row */}
            <div className="border-t border-white/[0.06] group-hover:border-emerald-500/10 pt-4 flex items-center justify-between text-[11px] font-medium text-zinc-500">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider">
                <CheckCircle className="h-3 w-3 text-emerald-400/80" />
                Production Standard
              </span>
              <span className="font-mono text-zinc-600 group-hover:text-zinc-500 transition-colors">
                {doc.slug.replace(/-/g, '_')}.md
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
