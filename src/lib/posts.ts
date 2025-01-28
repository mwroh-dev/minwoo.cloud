import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { z } from 'zod';

import { IPost } from '@/types/mdx';

const POSTS_PATH = path.join(process.cwd(), "src", "posts")

export function getPostSlugs() {
  return fs.readdirSync(POSTS_PATH).filter(file => file.endsWith(".mdx"));
}

const PostSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  description: z.string(),
  tags: z.array(z.string()),
  thumbnail: z.string(),
  title: z.string(),
});

export function getPostBySlug(slug: string): IPost {
  const fullPath = path.join(POSTS_PATH, slug);

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data } = matter(fileContents);

  try {
    return PostSchema.parse(data);
  } catch (error) {
    console.error(`Invalid metadata in ${slug}.mdx`, error);
    throw new Error("Metadata validation failed");
  }
}

export function getAllPosts() {
  const slugs = getPostSlugs();

  return slugs
    .map(s => getPostBySlug(s))
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );
}