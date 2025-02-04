import React from 'react';

import fs from 'fs';
import matter from 'gray-matter';
import { MDXComponents } from 'mdx/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import path from 'path';
import * as runtime from 'react/jsx-runtime';
import rehypePrism from 'rehype-prism-plus';
import remarkGfm from 'remark-gfm';

import { generateMetadata as generate } from '@/lib/metadata';
import { BLOG_URL, getPostBySlug, POSTS_PATH } from '@/lib/post';
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
    a: ({ href, children }) => (
      <a
        href={href}
        className="
          prose-a no-underline border-none
          text-blue-500 hover:bg-blue-100 hover:text-blue-800
        "
      >
        {children}
      </a>
    ),
    li: ({ children }) => (
      <li className="prose-li marker:text-blue-500">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="prose-blockquote border-blue-500 bg-blue-50">
        {children}
      </blockquote>
    ),
  };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {

  const resolvedParams = await params;
  if (!resolvedParams) {
    notFound();
  }

  const slug = decodeURIComponent(resolvedParams.slug);
  const post = getPostBySlug(`${slug}.mdx`);
  if(!post) {
    notFound();
  }

  return generate({
    description: post.description,
    thumbnail: post.thumbnail,
    title: post.title + ' | Minwoo.Roh',
    url: `${BLOG_URL}/blog/${slug}`,
  });
}

export async function generateStaticParams() {
  const filenames = fs.readdirSync(POSTS_PATH).filter((file) => file.endsWith(".mdx"));

  return filenames.map(name => ({
    slug: name.replace(/\.mdx$/, "")
  }));
}

async function BlogPost({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  "use server";

  const resolvedParams = await params;
  if (!resolvedParams) {
    notFound();
  }

  const slug = decodeURIComponent(resolvedParams.slug);
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
    <article className="prose mx-auto">
      <h1 className="text-2xl font-mono font-extrabold mb-5">
        {data.title}
      </h1>
      <p className="text-sm text-right">
        {data.date}
      </p>
      {compiledMDX.default({})}
    </article>
  );
}

export default BlogPost