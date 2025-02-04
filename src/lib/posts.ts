import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { z } from 'zod';

import { IPost } from '@/types/mdx';

export const POSTS_PATH = path.join(process.cwd(), "src", "posts");
export const BLOG_URL = 'https://minwoo.cloud';

export function getPostSlugs() {
  return fs.readdirSync(POSTS_PATH).filter(file => file.endsWith(".mdx"));
}

const PostSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  description: z.string(),
  slug: z.string(),
  tags: z.array(z.string()),
  thumbnail: z.string(),
  title: z.string(),
});

export function getPostBySlug(slug: string): IPost | null {
  const fullPath = path.join(POSTS_PATH, slug);

  if (!fs.existsSync(fullPath)){
    console.error(`File not found: ${fullPath}`);
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);

  const parsed = PostSchema.safeParse({
    date: data.date,
    description: data.description,
    slug: slug.replace(/\.mdx$/, ""),
    tags: data.tags,
    thumbnail: data.thumbnail,
    title: data.title,
  });

  if (!parsed.success) {
    console.error(`Invalid metadata in ${slug}`, parsed.error);
    return null;
  }

  return parsed.data;
}

export function getAllPosts() {
  const slugs = getPostSlugs();

  return slugs
    .map(s => getPostBySlug(s))
    .filter((post): post is IPost => post !== null)
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );
}