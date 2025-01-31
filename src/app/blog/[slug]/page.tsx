import React from 'react';

import fs from 'fs';
import matter from 'gray-matter';
import { MDXComponents } from 'mdx/types';
import { notFound } from 'next/navigation';
import path from 'path';
import * as runtime from 'react/jsx-runtime';
import rehypePrism from 'rehype-prism-plus';
import remarkGfm from 'remark-gfm';

import { POSTS_PATH } from '@/lib/posts';
import { evaluate } from '@mdx-js/mdx';

/**
  Reasoning Behind the Current Setup

  1.	Server-Side Rendering (SSR) Only
	•	The blog primarily consists of static content, eliminating the need for dynamic client-side resources.
	•	Rendering on the server reduces unnecessary client-side computations.

	2.	Minimization of External Library Dependencies
	•	Prioritizing readability and maintainability by using only essential libraries.
	•	Reducing unnecessary package dependencies to minimize bundle size, improve security, and enhance performance.
*/

function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return {
    ...components,
  };
}

export async function generateStaticParams() {
  const filenames = fs.readdirSync(POSTS_PATH).filter((file) => file.endsWith(".mdx"));

  return filenames.map((filename) => ({
    slug: filename.replace(/\.mdx$/, ""),
  }));
}

async function BlogPost({ params }: { params: { slug: string } }) {
  "use server";

  const resolvedParams = await params;
  if (!resolvedParams.slug) {
    notFound();
  }

  const slug = decodeURIComponent(params.slug);
  const filePath = path.join(process.cwd(), "src", "posts", `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(fileContents);

  const compiledMDX = await evaluate(content, {
    ...runtime,
    useMDXComponents: () => useMDXComponents(),
    remarkPlugins: [[remarkGfm, { singleTilde: false }]],
    rehypePlugins: [[rehypePrism, { ignoreMissing: true }]],
  });

  return (
    <article className="prose prose-slate lg:prose-xl mx-auto">
      <h1 className="text-4xl font-bold">{data.title}</h1>
      <p className="text-sm text-gray-500">{data.date}</p>
      {compiledMDX.default({})}
    </article>
  );
}

export default BlogPost