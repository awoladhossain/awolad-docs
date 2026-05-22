import { getAllDocSlugs, getDocBySlug } from '@/lib/markdown';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllDocSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8 border-b pb-4 border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{doc.meta.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">{doc.meta.description}</p>
      </div>

      <article className="prose prose-blue dark:prose-invert max-w-none">
        <MDXRemote source={doc.content} />
      </article>
    </main>
  );
}
