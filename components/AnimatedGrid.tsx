'use client';

import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';

interface Doc {
  slug: string;
  title: string;
  description: string;
  category: string;
}

// ফেইড-ইন এবং সাটল (Subtle) স্প্রিং ট্রানজিশন কন্টেইনার
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 130, damping: 20 },
  },
} as const;

export default function AnimatedGrid({ docs }: { docs: Doc[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mx-auto"
    >
      {docs.map((doc) => (
        <motion.div
          key={doc.slug}
          variants={cardVariants}
          whileHover={{ y: -5, boxShadow: '0px 15px 40px rgba(16, 185, 129, 0.15)' }}
          whileTap={{ scale: 0.98 }}
          className="group relative rounded-2xl bg-black/30 border border-white/10 backdrop-blur-xl p-7 transition-all duration-300 hover:border-emerald-400/40 hover:bg-emerald-950/10"
        >
          {/* Subtle Accent Glow Effect */}
          <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-emerald-500/10 pointer-events-none transition-all duration-300" />

          <Link href={`/docs/${doc.slug}`} className="flex flex-col h-full space-y-7 relative z-10">
            <div className="space-y-4">
              {/* Top Meta: File Icon, Slug Box & Action Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-black/35 rounded-xl border border-white/10 text-slate-500 group-hover:text-emerald-300 group-hover:bg-emerald-500/5 group-hover:border-emerald-400/20 transition-all duration-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-slate-500 uppercase bg-black/35 px-3 py-1 rounded-full border border-white/10 group-hover:border-emerald-400/15 group-hover:text-emerald-300 transition-all duration-300">
                      {doc.category}
                    </span>
                    <span className="hidden text-[10px] font-mono tracking-widest text-slate-600 uppercase sm:inline">
                      {doc.slug.replace(/-/g, '_')}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-emerald-400 transform group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-extrabold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-400 transition-all duration-300 leading-snug">
                {doc.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 pl-0.5">
                {doc.description}
              </p>
            </div>

            {/* Bottom Footer Meta */}
            <div className="border-t border-white/10 group-hover:border-emerald-400/15 pt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                Vercel (App)
              </span>
              <span className="font-mono text-[10px]">Markdown note</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
