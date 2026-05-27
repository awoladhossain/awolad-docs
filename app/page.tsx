import AnimatedGrid from '@/components/AnimatedGrid';
import TerminalWidget from '@/components/TerminalWidget';
import { getAllDocSlugs, getDocBySlug } from '@/lib/markdown';
import Link from 'next/link';
import { BookOpen, ChevronLeft, ChevronRight, Database, Terminal, Cpu, Sparkles } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{
    category?: string | string[];
    page?: string | string[];
  }>;
}

const PAGE_SIZE = 4;

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildHomeHref(category: string, page = 1) {
  const params = new URLSearchParams();

  if (category !== 'All') {
    params.set('category', category);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const query = params.toString();

  return query ? `/?${query}` : '/';
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = await searchParams;
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
        category: doc?.meta?.category || 'General',
      };
    }),
  );

  const sortedDocs = docs.sort((a, b) => a.title.localeCompare(b.title));
  const categories = ['All', ...Array.from(new Set(sortedDocs.map((doc) => doc.category))).sort()];
  const requestedCategory = getQueryValue(query.category) || 'All';
  const selectedCategory = categories.includes(requestedCategory) ? requestedCategory : 'All';
  const requestedPage = Number(getQueryValue(query.page) || '1');
  const filteredDocs =
    selectedCategory === 'All'
      ? sortedDocs
      : sortedDocs.filter((doc) => doc.category === selectedCategory);
  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, requestedPage || 1), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleDocs = filteredDocs.slice(startIndex, startIndex + PAGE_SIZE);

  // Helper to generate dynamic page ranges with ellipses
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090b] text-white selection:bg-emerald-500/20 selection:text-emerald-200 antialiased">
      {/* Background Radial and Mesh Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[140px] gsap-ambient-glow-1" />
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-teal-500/8 blur-[120px] gsap-ambient-glow-2" />
        <div className="absolute bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#10b981]/5 blur-[130px]" />
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-12 pb-24 relative z-10">
        {/* Navbar */}
        <nav className="flex items-center justify-between mb-16 border-b border-white/[0.06] pb-6">
          <div className="flex items-center gap-3 gsap-magnetic">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 shadow-lg shadow-emerald-950/40">
              <BookOpen className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <span className="text-md font-bold tracking-tight text-white font-mono uppercase">
              CORE KERNEL HUB
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5 text-xs font-semibold text-zinc-400 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {docs.length} Active Modules
            </span>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="max-w-4xl mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-300 shadow-inner backdrop-blur-md gsap-hero-badge">
            <Sparkles className="h-3.5 w-3.5" />
            System Design & Engineering
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.15] text-white gsap-hero-title">
            Advanced System <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 drop-shadow-[0_4px_20px_rgba(52,211,153,0.15)]">
              Engineering Manuals
            </span>
          </h1>

          <p className="text-md sm:text-lg text-zinc-400 max-w-2xl font-light leading-relaxed gsap-hero-desc">
            মেমরি ডিস্ট্রিবিউশন, প্রসেস ভার্চুয়ালাইজেশন এবং আই/ও মাল্টিপ্লেক্সিং এর মতো জটিল আর্কিটেকচারগুলোর প্রফেশনাল রিসোর্স হাব। প্রতিটি ম্যানুয়াল বাস্তবসম্মত সিস্টেম টিউনিং ও সিনিয়র-লেভেল প্রোডাকশন ইনসাইট দ্বারা সমৃদ্ধ।
          </p>

          {/* Stats Dashboard Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 max-w-3xl">
            <div className="flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 backdrop-blur-sm gsap-stat-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Total Concepts</div>
                <div className="text-lg font-bold text-white">60+ Topics</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 backdrop-blur-sm gsap-stat-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Build Status</div>
                <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Healthy
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 backdrop-blur-sm gsap-stat-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Standard</div>
                <div className="text-lg font-bold text-white">Senior Level</div>
              </div>
            </div>
          </div>

          {/* Dynamic Interactive Shell Terminal Simulator */}
          <TerminalWidget />
        </header>

        {/* Section Heading & Category Filter */}
        <div className="space-y-6 mb-10">
          <section className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2.5">
              <Terminal className="h-4.5 w-4.5 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Knowledge Base Modules
              </h2>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Markdown & Mermaid Powered
            </div>
          </section>

          {/* Styled Filter Pills */}
          <div className="flex flex-wrap gap-2.5">
            {categories.map((category) => {
              const active = category === selectedCategory;
              const count =
                category === 'All'
                  ? sortedDocs.length
                  : sortedDocs.filter((doc) => doc.category === category).length;

              return (
                <Link
                  key={category}
                  href={buildHomeHref(category)}
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    px-4
                    py-2.5
                    text-xs
                    font-semibold
                    transition-all
                    gsap-filter-pill
                    ${
                      active
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-950/20'
                        : 'border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:border-white/15 hover:text-white hover:bg-white/[0.04]'
                    }
                  `}
                >
                  <span>{category}</span>
                  <span className={`font-mono text-[10px] rounded px-1.5 py-0.5 ${
                    active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/[0.04] text-zinc-500'
                  }`}>{count}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Cards Grid */}
        <AnimatedGrid docs={visibleDocs} />

        {/* Pagination & Footer Meta */}
        <div className="mt-12 flex flex-col gap-6 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-zinc-500 font-mono">
            Showing {visibleDocs.length} of {filteredDocs.length} modules
            {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          </div>

          <div className="flex items-center justify-center gap-2">
            {/* Previous Button */}
            <Link
              href={buildHomeHref(selectedCategory, currentPage - 1)}
              aria-disabled={currentPage === 1}
              className={`
                inline-flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                transition-all
                ${
                  currentPage === 1
                    ? 'pointer-events-none border-white/[0.03] text-zinc-800 bg-white/[0.01]'
                    : 'border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:border-emerald-500/30 hover:text-white hover:bg-emerald-500/5'
                }
              `}
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>

            {/* Page Number Pills */}
            <div className="flex items-center gap-1.5">
              {getPageNumbers().map((pageNum, index) => {
                if (pageNum === '...') {
                  return (
                    <span
                      key={`dots-${index}`}
                      className="inline-flex h-9 w-9 items-center justify-center text-xs font-semibold text-zinc-600 font-mono"
                    >
                      ...
                    </span>
                  );
                }

                const pageActive = pageNum === currentPage;
                return (
                  <Link
                    key={`page-${pageNum}`}
                    href={buildHomeHref(selectedCategory, Number(pageNum))}
                    className={`
                      inline-flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      border
                      text-xs
                      font-mono
                      font-bold
                      transition-all
                      ${
                        pageActive
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-md shadow-emerald-950/20'
                          : 'border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:border-white/10 hover:text-white hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>

            {/* Next Button */}
            <Link
              href={buildHomeHref(selectedCategory, currentPage + 1)}
              aria-disabled={currentPage === totalPages}
              className={`
                inline-flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                transition-all
                ${
                  currentPage === totalPages
                    ? 'pointer-events-none border-white/[0.03] text-zinc-800 bg-white/[0.01]'
                    : 'border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:border-emerald-500/30 hover:text-white hover:bg-emerald-500/5'
                }
              `}
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modern Glassmorphic Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0c0c10]/40 backdrop-blur-md relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          <div className="text-center md:text-left">
            © {new Date().getFullYear()} MD Core Docs by{' '}
            <span className="text-emerald-400 font-semibold">Awolad Hossain</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-end">
            <a
              href="mailto:awoladh04@gmail.com"
              className="text-zinc-500 transition-colors hover:text-emerald-400 normal-case"
            >
              awoladh04@gmail.com
            </a>
            <span className="text-zinc-800">•</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Knowledge Base
            </span>
            <span className="text-zinc-800">•</span>
            <span>Next.js V16</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
