import AnimatedGrid from '@/components/AnimatedGrid';
import { getAllDocSlugs, getDocBySlug } from '@/lib/markdown';
import { BookOpen, Database, FileText } from 'lucide-react';

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
          `Structured notes and practical references from ${slug}.md.`,
      };
    }),
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_32%),radial-gradient(circle_at_82%_16%,rgba(20,184,166,0.1),transparent_28%),#09090b] text-white selection:bg-emerald-500/20 selection:text-emerald-200 antialiased font-jakarta">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />

      <div className="max-w-5xl mx-auto px-6 pt-16 pb-20 relative z-10">
        <nav className="flex items-center justify-between mb-20 border-b border-emerald-400/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/12 border border-emerald-400/20 flex items-center justify-center shadow-lg shadow-emerald-950/30">
              <BookOpen className="h-4 w-4 text-emerald-200" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              MD Core Docs
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5 bg-black/30 px-4 py-2 rounded-full border border-white/10 hover:border-emerald-400/20 transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {docs.length} documents
            </span>
          </div>
        </nav>

        <header className="max-w-4xl mb-24 space-y-7">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/25 text-emerald-300 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-md shadow-lg shadow-emerald-950/50">
            <Database className="h-3.5 w-3.5" />
            Database and Engineering Notes
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            Structured docs for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#2ec46b] to-teal-400 drop-shadow-[0_4px_20px_rgba(46,196,107,0.15)]">
              practical learning
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-medium leading-relaxed">
            ডাটাবেজ ডিজাইন, SQL কনসেপ্ট এবং ইঞ্জিনিয়ারিং নোটগুলো এক জায়গায় সাজানো।
            প্রতিটি ডকুমেন্ট সংক্ষিপ্ত, পরিষ্কার এবং দ্রুত রিভিশনের জন্য তৈরি।
          </p>
        </header>

        <section className="mb-10 flex items-center justify-between border-b border-emerald-400/10 pb-5">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Available Documents
            </h2>
            <span className="text-xs px-3 py-1 rounded-full bg-black/30 border border-white/10 text-emerald-300 font-mono font-bold shadow-inner">
              {docs.length} docs
            </span>
          </div>
          <div className="text-xs text-slate-600 font-mono tracking-widest uppercase">
            Markdown powered
          </div>
        </section>

        <AnimatedGrid docs={docs} />
      </div>

      <footer className="max-w-5xl mx-auto px-6 py-14 border-t border-emerald-400/10 text-[11px] font-mono text-slate-600 tracking-widest uppercase flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        <div>© {new Date().getFullYear()} MD Core Docs</div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Personal Knowledge Base
          </span>
          <span className="text-slate-800">•</span>
          <span>Next.js</span>
          <span className="text-slate-800">•</span>
          <span>Markdown</span>
        </div>
      </footer>
    </div>
  );
}
