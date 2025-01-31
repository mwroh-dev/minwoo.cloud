import Image from 'next/image';
import Link from 'next/link';

import TagChip from '@/components/tag-chip';
import { getAllPosts } from '@/lib/posts';
import { IPost } from '@/types/mdx';

function PostCard({
  loading,
  post,
  priority,
}: {
  loading?: "eager" | "lazy" | undefined;
  post: IPost;
  priority?: boolean;
}) {
  const { date, thumbnail, title, tags, description } = post;

  return (
    <Link key={post.slug} href={`/blog/${post.slug}`}>
      <div key={date} className="rounded-xl shadow-lg bg-white">
        <div className="relative">
          <Image
            src={thumbnail}
            alt={`${title}-thumbnail image`}
            layout="responsive"
            width={16}
            height={10}
            className="object-cover"
            priority={priority}
            loading={loading}
          />
          <div className="
            absolute top-2 right-2 p-1 bg-transparent
            border border-white rounded-md
            text-white text-xs font-semibold">
            {date}
          </div>
        </div>
        <div className="p-4">
          {tags && <TagChip tag={tags[0]} />}
          <h2 className="mt-2 text-lg font-semibold text-gray-900 line-clamp-2">{title}</h2>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
      </div>
    </Link>
  )
}

export default function BlogPage() {
  const allPosts = getAllPosts();

  return (
    <section className="flex flex-col gap-8">
      <div className="w-full pb-2 border-b-2 border-black">
        <h1 className="text-left text-xl font-bold text-gray-800">Posts</h1>
        <h3 className="text-left text-l font-bold text-gray-800">
          Sharing my journey: Growth, Experience, and Insights
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-8">
        {allPosts.map((post, index) =>
          <PostCard
            key={post.date}
            post={post}
            priority={index < 3}
            loading={index >= 3 ? "lazy" : undefined}
          />
        )}
      </div>
    </section>
  );
}