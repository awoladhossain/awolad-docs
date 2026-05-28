import Mermaid from '@/components/Mermaid';
import { getAllDocSlugs, getDocBySlug } from '@/lib/markdown';
import {
  ArrowLeft,
  Bookmark,
  Cpu,
  FileText,
  HelpCircle,
  List,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { type ComponentPropsWithoutRef } from 'react';
import remarkGfm from 'remark-gfm';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({
    slug,
  }));
}

function extractHeadings(content: string) {
  const regex = /^##\s+(.*)$/gm;
  const headings = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push(match[1]);
  }
  return headings;
}

function getMermaidChart(children: React.ReactNode): string | null {
  if (!children) return null;
  if (React.isValidElement(children)) {
    const props = children.props as { className?: string; children?: React.ReactNode };
    if (props?.className === 'language-mermaid') {
      return props.children?.toString() || '';
    }
    if (props?.children) {
      return getMermaidChart(props.children);
    }
  }
  if (Array.isArray(children)) {
    for (const child of children) {
      const chart = getMermaidChart(child);
      if (chart !== null) return chart;
    }
  }
  return null;
}

const components = {
  Math: (props: { children: React.ReactNode }) => (
    <div className="my-6 overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-6 py-4.5 backdrop-blur-sm flex items-center justify-center font-mono text-sm md:text-base text-emerald-300 shadow-sm shadow-emerald-950/20 gsap-scroll-reveal">
      <div className="text-center font-semibold tracking-wide select-all overflow-x-auto whitespace-nowrap scrollbar-none w-full">
        {props.children}
      </div>
    </div>
  ),

  h2: (props: ComponentPropsWithoutRef<'h2'>) => {
    const text = props.children?.toString() || '';
    const id = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');

    return (
      <h2
        id={id}
        className="
          group
          scroll-mt-24
          mt-14
          mb-6
          text-2xl
          md:text-3xl
          font-extrabold
          tracking-tight
          text-white
          border-b
          border-white/[0.06]
          pb-2
          flex
          items-center
          gap-2
          gsap-scroll-reveal
        "
      >
        <span>{props.children}</span>
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 text-emerald-400 hover:text-emerald-300 transition-opacity text-[15px] font-mono select-none"
        >
          #
        </a>
      </h2>
    );
  },

  h3: (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3
      className="
        scroll-mt-24
        mt-10
        mb-4
        text-lg
        md:text-xl
        font-bold
        text-zinc-100
        tracking-tight
      "
      {...props}
    />
  ),

  p: (props: ComponentPropsWithoutRef<'p'>) => (
    <p
      className="
        my-5
        text-[15px]
        md:text-[16px]
        leading-relaxed
        text-zinc-350
        font-normal
      "
      {...props}
    />
  ),

  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <ul
      className="
        my-5
        ml-6
        list-disc
        space-y-2.5
        text-zinc-300
        text-[15px]
        md:text-[16px]
      "
      {...props}
    />
  ),

  ol: (props: ComponentPropsWithoutRef<'ol'>) => (
    <ol
      className="
        my-5
        ml-6
        list-decimal
        space-y-2.5
        text-zinc-300
        text-[15px]
        md:text-[16px]
      "
      {...props}
    />
  ),

  li: (props: ComponentPropsWithoutRef<'li'>) => <li className="leading-relaxed" {...props} />,

  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-bold text-white bg-white/[0.06] px-1 rounded-sm" {...props} />
  ),

  code: (props: ComponentPropsWithoutRef<'code'>) => (
    <code
      className="
        rounded-lg
        border
        border-white/[0.08]
        bg-white/[0.03]
        px-1.5
        py-0.5
        text-[13px]
        font-mono
        text-emerald-300
        font-semibold
      "
      {...props}
    />
  ),

  pre: (props: ComponentPropsWithoutRef<'pre'>) => {
    const chart = getMermaidChart(props.children);
    if (chart !== null) {
      return <Mermaid chart={chart} />;
    }

    let lang = 'code';
    if (React.isValidElement(props.children)) {
      const childrenProps = props.children.props as { className?: string };
      const className = childrenProps?.className || '';
      const match = className.match(/language-(\w+)/);
      if (match) {
        lang = match[1];
      }
    }

    return (
      <div className="my-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c10]/80 shadow-lg relative group">
        {/* Mac OS Style Window Title bar */}
        <div className="flex items-center justify-between border-b border-white/[0.05] bg-white/[0.02] px-4 py-2.5">
          <div className="flex items-center gap-1.5 select-none">
            <div className="h-2 w-2 rounded-full bg-[#ef4444]/80" />
            <div className="h-2 w-2 rounded-full bg-[#f59e0b]/80" />
            <div className="h-2 w-2 rounded-full bg-[#10b981]/80" />
          </div>
          <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-500 select-none">
            {lang}
          </div>
        </div>
        <pre
          className="
            overflow-x-auto
            p-5
            font-mono
            text-[13px]
            leading-relaxed
            text-zinc-300
            scrollbar-thin
            bg-transparent
            m-0
          "
          {...props}
        />
      </div>
    );
  },

  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <div className="my-6 relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-emerald-500/[0.03] to-teal-500/[0.01] p-5 backdrop-blur-sm gsap-scroll-reveal">
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-emerald-400 to-teal-400" />
      <div className="flex gap-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="text-[14px] md:text-[15px] leading-relaxed text-zinc-300 font-medium italic [&>p]:m-0">
          {props.children}
        </div>
      </div>
    </div>
  ),

  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="my-6 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c10]/40 backdrop-blur-md gsap-scroll-reveal">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm" {...props} />
      </div>
    </div>
  ),

  thead: (props: ComponentPropsWithoutRef<'thead'>) => (
    <thead className="bg-emerald-500/[0.08] border-b border-white/[0.06] text-white" {...props} />
  ),

  tbody: (props: ComponentPropsWithoutRef<'tbody'>) => (
    <tbody className="divide-y divide-white/[0.04]" {...props} />
  ),

  tr: (props: ComponentPropsWithoutRef<'tr'>) => (
    <tr className="transition-colors hover:bg-white/[0.02]" {...props} />
  ),

  th: (props: ComponentPropsWithoutRef<'th'>) => (
    <th
      className="
        whitespace-nowrap
        px-4
        py-3
        text-xs
        font-bold
        uppercase
        tracking-wider
        text-emerald-400
      "
      {...props}
    />
  ),

  td: (props: ComponentPropsWithoutRef<'td'>) => (
    <td
      className="
        px-4
        py-3
        align-top
        leading-relaxed
        text-zinc-300
      "
      {...props}
    />
  ),

  hr: () => <div className="my-10 h-px bg-white/[0.06]" />,
};

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const allSlugs = getAllDocSlugs();
  const allDocs = await Promise.all(
    allSlugs.map(async (s) => {
      const d = await getDocBySlug(s);
      return {
        slug: s,
        title: d?.meta?.title || s.replace(/-/g, ' ').toUpperCase(),
        category: d?.meta?.category || 'General',
      };
    }),
  );

  // Group all document nodes by their category metadata
  const categoriesMap = allDocs.reduce(
    (acc, item) => {
      const cat = item.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, typeof allDocs>,
  );

  const toc = extractHeadings(doc.content);

  return (
    <div className="min-h-screen bg-[#09090b] text-white antialiased">
      <div className="flex">
        {/* Sidebar */}
        <aside
          className="
            sticky
            top-0
            hidden
            h-screen
            w-72
            shrink-0
            flex-col
            border-r
            border-white/[0.06]
            bg-[#0c0c10]/40
            backdrop-blur-xl
            lg:flex
          "
        >
          {/* Back Home Header */}
          <div className="border-b border-white/[0.06] px-5 py-5">
            <Link
              href="/"
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-1.5
                rounded-xl
                border
                border-white/[0.05]
                bg-white/[0.02]
                px-3
                py-2.5
                text-xs
                font-semibold
                text-zinc-400
                transition-all
                hover:bg-white/[0.06]
                hover:text-white
                gsap-magnetic
              "
            >
              <ArrowLeft className="h-3.5 w-3.5 text-zinc-500" />
              Back to Dashboard
            </Link>
          </div>

          {/* Categorized Sidebar Nav */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7 scrollbar-thin" data-lenis-prevent="true">
            {Object.entries(categoriesMap).map(([catName, catDocs]) => (
              <div key={catName} className="space-y-2">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  {catName}
                </div>
                <nav className="space-y-1">
                  {catDocs.map((item) => {
                    const active = item.slug === slug;
                    return (
                      <Link
                        key={item.slug}
                        href={`/docs/${item.slug}`}
                        className={`
                          group
                          flex
                          items-center
                          gap-2.5
                          rounded-xl
                          border
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          transition-all
                          ${
                            active
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300 shadow-md shadow-emerald-950/20'
                              : 'border-transparent text-zinc-400 hover:border-white/[0.04] hover:bg-white/[0.02] hover:text-zinc-200'
                          }
                        `}
                      >
                        <FileText
                          className={`
                            h-4
                            w-4
                            shrink-0
                            ${
                              active
                                ? 'text-emerald-400'
                                : 'text-zinc-600 group-hover:text-zinc-400'
                            }
                          `}
                        />
                        <span className="min-w-0 truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Pane */}
        <main
          className="
            relative
            min-w-0
            flex-1
            overflow-x-clip
            bg-[#09090b]
          "
        >
          {/* Floating background lighting */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-5%] left-[5%] w-[45%] h-[35%] rounded-full bg-emerald-500/5 blur-[120px]" />
            <div className="absolute bottom-[15%] right-[-5%] w-[40%] h-[40%] rounded-full bg-teal-500/4 blur-[100px]" />
          </div>

          {/* Top Floating Bar */}
          <div
            className="
              sticky
              top-0
              z-40
              border-b
              border-white/[0.06]
              bg-[#09090b]/80
              backdrop-blur-md
              relative
            "
          >
            <div className="mx-auto flex h-14 max-w-7xl items-center px-6 md:px-8 justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                <Terminal className="h-4 w-4 text-emerald-500" />
                Module: <span className="text-zinc-300 ml-1 font-semibold">{doc.meta.title}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-wider shadow-inner">
                <Cpu className="h-3 w-3 text-emerald-400" />
                Verified Reference
              </div>
            </div>
            {/* Live GSAP reading progress bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 gsap-reading-progress w-0" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-7xl">
            {/* MDX Article Body */}
            <div className="min-w-0 flex-1 px-6 py-12 md:py-16 lg:px-12">
              <div className="mx-auto max-w-3xl">
                {/* Stripe-Style Page Header with Breadcrumbs */}
                <header className="mb-14 border-b border-white/[0.06] pb-8">
                  {/* Breadcrumb Trail */}
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-5 select-none">
                    <Link href="/" className="hover:text-emerald-400 transition-colors">
                      Home
                    </Link>
                    <span>/</span>
                    <span>Docs</span>
                    <span>/</span>
                    <span className="text-emerald-400 font-bold">{doc.meta.title}</span>
                  </div>

                  <h1
                    className="
                      text-3xl
                      md:text-5xl
                      font-black
                      tracking-tight
                      text-white
                      leading-tight
                    "
                  >
                    {doc.meta.title}
                  </h1>

                  {/* Metadata Dashboard Bar */}
                  <div className="flex flex-wrap items-center gap-y-3 gap-x-5 mt-6 text-xs text-zinc-500 font-mono border-t border-white/[0.04] pt-5 select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Synced in Prod</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Bookmark className="h-3.5 w-3.5 text-zinc-600" />
                      <span>Category:</span>
                      <span className="text-emerald-400 font-bold uppercase">
                        {doc.meta.category}
                      </span>
                    </div>
                    <span>•</span>
                    <div>
                      <span>Reading Time: 10 min read</span>
                    </div>
                  </div>
                </header>

                {/* Rendered MDX Content */}
                <article className="prose prose-invert max-w-none">
                  <MDXRemote
                    source={doc.content}
                    components={components}
                    options={{
                      mdxOptions: {
                        format: 'md',
                        remarkPlugins: [remarkGfm],
                      },
                    }}
                  />
                </article>
              </div>
            </div>

            {/* Sidebar Table of Contents (TOC) */}
            <aside
              className="
                hidden
                xl:block
                w-72
                shrink-0
                px-6
                py-16
              "
            >
              <div className="sticky top-24 border border-white/[0.05] bg-[#0c0c10]/40 backdrop-blur-md rounded-2xl p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">
                  <List className="h-3.5 w-3.5 text-emerald-400" />
                  On this page
                </div>

                <ul className="space-y-3 max-h-[50vh] overflow-y-auto scrollbar-none pr-1" data-lenis-prevent="true">
                  {toc.map((heading, index) => (
                    <li key={index}>
                      <a
                        href={`#${heading
                          .toLowerCase()
                          .replace(/[^\w\s]/g, '')
                          .replace(/\s+/g, '-')}`}
                        className="
                          text-xs
                          font-medium
                          leading-relaxed
                          text-zinc-400
                          transition-all
                          hover:text-emerald-400
                          hover:pl-0.5
                          block
                          truncate
                          gsap-toc-link
                        "
                        title={heading}
                      >
                        • {heading}
                      </a>
                    </li>
                  ))}
                </ul>

                {/* Feedback Box */}
                <div className="mt-6 pt-5 border-t border-white/[0.05] space-y-2">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    <HelpCircle className="h-3 w-3 text-zinc-500" />
                    Helpful?
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white/[0.02] border border-white/[0.05] text-[10px] font-semibold text-zinc-400 py-1 rounded hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-300 transition-colors">
                      Yes
                    </button>
                    <button className="flex-1 bg-white/[0.02] border border-white/[0.05] text-[10px] font-semibold text-zinc-400 py-1 rounded hover:bg-[#ef4444]/10 hover:border-[#ef4444]/20 hover:text-[#ef4444]/30 transition-colors">
                      No
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
