import { getAllDocSlugs, getDocBySlug } from '@/lib/markdown';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, FileText, List, Sparkles, Star } from 'lucide-react';
import React, { type ComponentPropsWithoutRef } from 'react';
import Mermaid from '@/components/Mermaid';

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
    const props = children.props as any;
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
          scroll-mt-24
          mt-16
          mb-6
          text-2xl
          md:text-3xl
          font-extrabold
          tracking-tight
          text-white
          border-b
          border-white/[0.06]
          pb-2
        "
        {...props}
      />
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
        text-zinc-300
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

  li: (props: ComponentPropsWithoutRef<'li'>) => (
    <li className="leading-relaxed" {...props} />
  ),

  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-bold text-white bg-white/[0.04] px-1 rounded-sm" {...props} />
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
    return (
      <pre
        className="
          my-6
          overflow-x-auto
          rounded-xl
          border
          border-white/[0.06]
          bg-[#0b0b0f]/80
          p-4
          font-mono
          text-[13px]
          leading-relaxed
          text-zinc-300
          scrollbar-thin
        "
        {...props}
      />
    );
  },

  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="
        my-6
        border-l-4
        border-emerald-500/40
        bg-emerald-500/[0.03]
        rounded-r-xl
        py-4
        pl-5
        pr-4
        text-[15px]
        italic
        text-zinc-300
        leading-relaxed
      "
      {...props}
    />
  ),

  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="my-6 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0c0c10]/40 backdrop-blur-md">
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

  const allDocs = await Promise.all(
    getAllDocSlugs().map(async (s) => {
      const d = await getDocBySlug(s);

      return {
        slug: s,
        title: d?.meta?.title || s,
      };
    }),
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
            bg-[#0c0c10]/50
            backdrop-blur-xl
            lg:flex
          "
        >
          {/* Sidebar Header */}
          <div className="border-b border-white/[0.06] px-5 py-5 flex items-center justify-between">
            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-xl
                border
                border-white/[0.05]
                bg-white/[0.02]
                px-3
                py-2
                text-xs
                font-semibold
                text-zinc-400
                outline-none
                transition-all
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </div>

          {/* Sidebar Nav links */}
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
            <div
              className="
                mb-4
                flex
                items-center
                gap-2.5
                rounded-xl
                border
                border-emerald-500/20
                bg-emerald-500/5
                px-3
                py-2.5
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-emerald-400
              "
            >
              <BookOpen className="h-4 w-4" />
              <span>Table of Contents</span>
            </div>

            <nav className="space-y-1.5">
              {allDocs.map((item) => {
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
                      py-2.5
                      text-xs
                      font-semibold
                      outline-none
                      transition-all
                      ${
                        active
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-md shadow-emerald-950/20'
                          : 'border-transparent text-zinc-400 hover:border-white/[0.05] hover:bg-white/[0.03] hover:text-zinc-200'
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
        </aside>

        {/* Main Content Pane */}
        <main
          className="
            relative
            min-w-0
            flex-1
            overflow-hidden
            bg-[#09090b]
          "
        >
          {/* Blurred Background Lights */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
            <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[45%] rounded-full bg-teal-500/5 blur-[100px]" />
          </div>

          {/* Sticky Topbar */}
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
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Viewing: <span className="text-emerald-400 font-semibold">{doc.meta.title}</span>
              </div>
              
              <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                <Star className="h-3 w-3 fill-emerald-400" />
                Senior Resource
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto flex max-w-7xl">
            {/* MDX Article Body */}
            <div className="min-w-0 flex-1 px-6 py-12 md:py-16 lg:px-12">
              <div className="mx-auto max-w-3xl">
                {/* Custom Page Header */}
                <header className="mb-14 border-b border-white/[0.06] pb-8">
                  <div
                    className="
                      mb-4
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-emerald-500/20
                      bg-emerald-500/5
                      px-3
                      py-1
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-widest
                      text-emerald-400
                    "
                  >
                    <Sparkles className="h-3 w-3" />
                    Documentation Module
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

                  <p
                    className="
                      mt-4
                      max-w-2xl
                      text-[15px]
                      md:text-[16px]
                      leading-relaxed
                      text-zinc-400
                    "
                  >
                    {doc.meta.description}
                  </p>
                </header>

                {/* Rendered MDX Content */}
                <article className="prose prose-invert max-w-none">
                  <MDXRemote
                    source={doc.content}
                    components={components}
                    options={{
                      mdxOptions: {
                        format: 'md',
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

                <ul className="space-y-3 scrollbar-none max-h-[70vh] overflow-y-auto">
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
                        "
                        title={heading}
                      >
                        • {heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
