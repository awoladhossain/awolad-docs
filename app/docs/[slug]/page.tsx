import { getAllDocSlugs, getDocBySlug } from '@/lib/markdown';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';
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
          scroll-mt-28
          mt-24
          mb-6
          text-3xl
          font-bold
          tracking-tight
          text-white
        "
        {...props}
      />
    );
  },

  h3: (props: ComponentPropsWithoutRef<'h3'>) => (
    <h3
      className="
        mt-14
        mb-4
        text-xl
        font-semibold
        text-white
      "
      {...props}
    />
  ),

  p: (props: ComponentPropsWithoutRef<'p'>) => (
    <p
      className="
        my-6
        text-[17px]
        leading-8
        text-zinc-400
      "
      {...props}
    />
  ),

  ul: (props: ComponentPropsWithoutRef<'ul'>) => (
    <ul
      className="
        my-6
        ml-6
        list-disc
        space-y-3
        text-zinc-400
      "
      {...props}
    />
  ),

  li: (props: ComponentPropsWithoutRef<'li'>) => (
    <li className="leading-8" {...props} />
  ),

  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold text-zinc-100" {...props} />
  ),

  code: (props: ComponentPropsWithoutRef<'code'>) => (
    <code
      className="
        rounded-md
        border
        border-white/10
        bg-white/[0.04]
        px-1.5
        py-1
        text-[14px]
        text-white
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
          my-8
          overflow-x-auto
          rounded-2xl
          border
          border-white/10
          bg-[#0d1117]
          p-5
        "
        {...props}
      />
    );
  },

  blockquote: (props: ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      className="
        my-8
        border-l-2
        border-white/20
        pl-6
        italic
        text-zinc-500
      "
      {...props}
    />
  ),

  table: (props: ComponentPropsWithoutRef<'table'>) => (
    <div className="my-8 overflow-hidden rounded-lg border border-white/10 bg-black/25">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm" {...props} />
      </div>
    </div>
  ),

  thead: (props: ComponentPropsWithoutRef<'thead'>) => (
    <thead className="bg-emerald-400/10 text-slate-100" {...props} />
  ),

  tbody: (props: ComponentPropsWithoutRef<'tbody'>) => (
    <tbody className="divide-y divide-white/10" {...props} />
  ),

  tr: (props: ComponentPropsWithoutRef<'tr'>) => (
    <tr className="transition-colors hover:bg-white/[0.03]" {...props} />
  ),

  th: (props: ComponentPropsWithoutRef<'th'>) => (
    <th
      className="
        whitespace-nowrap
        px-4
        py-3
        text-xs
        font-semibold
        uppercase
        tracking-wider
        text-emerald-200
      "
      {...props}
    />
  ),

  td: (props: ComponentPropsWithoutRef<'td'>) => (
    <td
      className="
        border-t
        border-white/10
        px-4
        py-3
        align-top
        leading-7
        text-slate-400
      "
      {...props}
    />
  ),

  hr: () => <div className="my-16 h-px bg-white/10" />,
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
    <div className="min-h-screen bg-[#09090b] text-white">
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
            border-white/10
            bg-black/30
            shadow-[1px_0_0_rgba(255,255,255,0.03)]
            lg:flex
          "
        >
          <div className="border-b border-white/10 px-5 py-5">
            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-2
                rounded-lg
                px-2
                py-1.5
                text-sm
                font-medium
                text-slate-400
                outline-none
                transition-colors
                hover:bg-white/[0.04]
                hover:text-white
                focus-visible:ring-2
                focus-visible:ring-emerald-400/50
              "
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div
              className="
                mb-4
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-white/10
                bg-white/[0.035]
                px-3
                py-3
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-slate-200
              "
            >
              <BookOpen className="h-4 w-4 text-emerald-400" />
              <span>Documentation</span>
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
                      rounded-lg
                      border
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      outline-none
                      transition-all
                      focus-visible:ring-2
                      focus-visible:ring-emerald-400/50
                      ${
                        active
                          ? 'border-emerald-400/25 bg-emerald-400/10 text-white shadow-sm shadow-emerald-950/30'
                          : 'border-transparent text-slate-500 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-200'
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
                            ? 'text-emerald-300'
                            : 'text-slate-600 group-hover:text-slate-300'
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

        {/* Main */}
        <main
          className="
            relative
            min-w-0
            flex-1
            overflow-hidden
            bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(20,184,166,0.08),transparent_28%),#09090b]
          "
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
          {/* Topbar */}
          <div
            className="
              sticky
              top-0
              z-40
              border-b
              border-white/10
              bg-[#09090b]/75
              backdrop-blur-xl
            "
          >
            <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
              <div className="text-sm text-zinc-500">
                {doc.meta.title}
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto flex max-w-7xl">
            {/* Content */}
            <div className="min-w-0 flex-1 px-6 py-16 lg:px-16">
              <div className="mx-auto max-w-3xl">
                {/* Header */}
                <header className="mb-20">
                  <div
                    className="
                      mb-5
                      inline-flex
                      items-center
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.03]
                      px-3
                      py-1
                      text-xs
                      text-zinc-400
                    "
                  >
                    Documentation
                  </div>

                  <h1
                    className="
                      text-5xl
                      font-bold
                      tracking-tight
                      text-white
                    "
                  >
                    {doc.meta.title}
                  </h1>

                  <p
                    className="
                      mt-6
                      max-w-2xl
                      text-lg
                      leading-8
                      text-zinc-500
                    "
                  >
                    {doc.meta.description}
                  </p>
                </header>

                {/* MDX */}
                <article>
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

            {/* TOC */}
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
              <div className="sticky top-24">
                <div className="mb-4 text-xs font-medium uppercase tracking-widest text-zinc-600">
                  On this page
                </div>

                <ul className="space-y-3">
                  {toc.map((heading, index) => (
                    <li key={index}>
                      <a
                        href={`#${heading
                          .toLowerCase()
                          .replace(/[^\w\s]/g, '')
                          .replace(/\s+/g, '-')}`}
                        className="
                          text-sm
                          leading-relaxed
                          text-zinc-500
                          transition-colors
                          hover:text-white
                        "
                      >
                        {heading}
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
