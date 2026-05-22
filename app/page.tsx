import AnimatedGrid from '@/components/AnimatedGrid';
import { getAllDocSlugs, getDocBySlug } from '@/lib/markdown';
import { Target, Zap } from 'lucide-react';

export default async function HomePage() {
  const slugs = getAllDocSlugs();

  const docs = await Promise.all(
    slugs.map(async (slug) => {
      const doc = await getDocBySlug(slug);
      return {
        slug,
        title: doc?.meta?.title || slug.replace(/-/g, ' ').toUpperCase(),
        description:
          doc?.meta?.description ||
          `Technical overview, schema definition, and architectural guidelines for ${slug}.md asset.`,
      };
    }),
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-white selection:bg-emerald-500/20 selection:text-emerald-200 antialiased font-jakarta overflow-hidden">
      {/* 🌌 মডার্ন ডায়নামিক ব্যাকগ্রাউন্ড লাইট ও গ্লো ইফেক্ট */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:5rem_5rem] opacity-[0.1] pointer-events-none" />

      {/* অ্যানিমেটেড নিওন অরবিটস (মডার্ন গ্লো) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-[#1e6b3e]/10 blur-[150px] rounded-full" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-teal-500/5 blur-[100px] rotate-12" />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-16 pb-20 relative z-10">
        {/* Navigation Bar (Clean Corporate Header) */}
        <nav className="flex items-center justify-between mb-20 border-b border-slate-800/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-[#1e6b3e] flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Zap className="h-4 w-4 text-white fill-white animate-pulse" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white font-mono">
              MD_CORE_v1.2
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5 bg-slate-900 px-4 py-2 rounded-full border border-slate-800 hover:border-emerald-500/10 transition-all cursor-pointer">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ENGINE STATUS: LIVE
            </span>
          </div>
        </nav>

        {/* Main Hero Area */}
        <header className="max-w-4xl mb-28 space-y-7">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-md shadow-lg shadow-emerald-950/50">
            <Zap className="h-3.5 w-3.5 fill-emerald-400 animate-pulse" />
            Dhaka&apos;s Next-Gen Knowledge Hub Platform
          </div>

          {/* এখানে </div> এর জায়গায় </h1> দিয়ে ফিক্স করা হয়েছে */}
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            Transform Ideas, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#2ec46b] to-teal-400 drop-shadow-[0_4px_20px_rgba(46,196,107,0.15)]">
              Own Your Code
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-medium leading-relaxed">
            আপনার লোকাল Markdown এবং README স্ট্রাকচারকে একটি ইন্টারেক্টিভ, হাইপার-ফাস্ট ও
            আর্কিটেকচারালি সাউন্ড নলেজ হাব-এ রূপান্তর করুন।
            <span className="text-white font-bold"> নো টেনশন, জাস্ট কোড!</span>
          </p>
        </header>

        {/* List Header */}
        <section className="mb-10 flex items-center justify-between border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Architecture Assets
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-mono font-bold shadow-inner">
              {docs.length} assets
            </span>
          </div>
          <div className="text-xs text-slate-600 font-mono tracking-widest uppercase">
            Next.js 15
          </div>
        </section>

        {/* Premium Grid Components */}
        <AnimatedGrid docs={docs} />
      </div>

      {/* Corporate Minimal Footer with Platform Status */}
      <footer className="max-w-5xl mx-auto px-6 py-14 border-t border-slate-900 text-[11px] font-mono text-slate-600 tracking-widest uppercase flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        <div>© {new Date().getFullYear()} CORE HUB INC. ALL RIGHTS RESERVED.</div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Static Hub v4
          </span>
          <span className="text-slate-800">•</span>
          <span>Tailwind v4</span>
          <span className="text-slate-800">•</span>
          <span>Framer Motion</span>
        </div>
      </footer>
    </div>
  );
}
