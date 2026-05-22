import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';

const contentDirectory = path.join(process.cwd(), 'content');

export async function getDocBySlug(slug: string) {
  const fullPath = path.join(contentDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    meta: data as { title: string; description: string },
    content,
  };
}

export function getAllDocSlugs() {
  const files = fs.readdirSync(contentDirectory);
  return files.map((file) => file.replace(/\.md$/, ''));
}
