import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { CONTENT_PATH, buildPostFromSource } from '@/lib/post';
import { IPost } from '@/types/post';

const CONTENT_ISSUE_CATEGORY = {
	LOGICAL_ERROR: 'LOGICAL_ERROR',
	PHYSICAL_ERROR: 'PHYSICAL_ERROR',
} as const;

export const CONTENT_ISSUE_CODE = {
	BROKEN_LEGACY_BLOG_LINK: 'BROKEN_LEGACY_BLOG_LINK',
	DUPLICATE_SLUG: 'DUPLICATE_SLUG',
	GLOBAL_SLUG_UNIQUENESS_CHECK_FAILED: 'GLOBAL_SLUG_UNIQUENESS_CHECK_FAILED',
	INVALID_FRONTMATTER: 'INVALID_FRONTMATTER',
	MISSING_PUBLIC_ASSET: 'MISSING_PUBLIC_ASSET',
} as const;

type ContentIssue = {
	category: (typeof CONTENT_ISSUE_CATEGORY)[keyof typeof CONTENT_ISSUE_CATEGORY];
	code: (typeof CONTENT_ISSUE_CODE)[keyof typeof CONTENT_ISSUE_CODE];
	detail?: string;
	file?: string;
};

type ContentCheckResult = { issues: ContentIssue[]; postsChecked: number };

type CollectedPost = { content: string; post: IPost };

function addIssue(input: { issue: ContentIssue; issues: ContentIssue[] }) {
	input.issues.push(input.issue);
}

function collectPosts(input: { contentPath: string; issues: ContentIssue[] }) {
	const posts: CollectedPost[] = [];

	if (!fs.existsSync(input.contentPath)) {
		return posts;
	}

	for (const entry of fs.readdirSync(input.contentPath, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith('.mdx')) {
			continue;
		}

		const sourcePath = path.join(input.contentPath, entry.name);
		const fileContents = fs.readFileSync(sourcePath, 'utf8');
		const post = buildPostFromSource({
			fileContents,
			slug: path.basename(entry.name, '.mdx'),
			sourcePath,
		});

		if (!post) {
			addIssue({
				issues: input.issues,
				issue: {
					category: CONTENT_ISSUE_CATEGORY.LOGICAL_ERROR,
					code: CONTENT_ISSUE_CODE.INVALID_FRONTMATTER,
					file: sourcePath,
				},
			});
			continue;
		}

		posts.push({ content: fileContents, post });
	}

	return posts;
}

function validateUniqueness(input: { issues: ContentIssue[]; posts: CollectedPost[] }) {
	const slugMap = new Map<string, string>();

	for (const { post } of input.posts) {
		const existingSlug = slugMap.get(post.slug);
		if (existingSlug) {
			addIssue({
				issues: input.issues,
				issue: {
					category: CONTENT_ISSUE_CATEGORY.LOGICAL_ERROR,
					code: CONTENT_ISSUE_CODE.DUPLICATE_SLUG,
					detail: post.slug,
					file: post.sourcePath,
				},
			});
		} else {
			slugMap.set(post.slug, post.sourcePath);
		}
	}
}

function isKnownInternalRoute(linkPath: string) {
	return linkPath === '/' || linkPath === '/blog';
}

function validateInternalLinks(input: {
	contentPath: string;
	issues: ContentIssue[];
	posts: CollectedPost[];
	publicPath: string;
}) {
	const blogPostPattern = /^\/blog\/([^/?#]+)$/;
	const linkPattern = /\[[^\]]+\]\((\/[^)\s?#]+)(?:[?#][^)]+)?\)/g;
	const slugs = input.posts.map(({ post }) => post.slug);
	const slugSet = new Set(slugs);

	for (const { content, post } of input.posts) {
		for (const match of content.matchAll(linkPattern)) {
			const linkPath = match[1];

			if (isKnownInternalRoute(linkPath)) {
				continue;
			}

			const blogPostMatch = linkPath.match(blogPostPattern);
			if (blogPostMatch) {
				const slug = blogPostMatch[blogPostMatch.length - 1] as string;
				if (!slugSet.has(slug)) {
					addIssue({
						issues: input.issues,
						issue: {
							category: CONTENT_ISSUE_CATEGORY.LOGICAL_ERROR,
							code: CONTENT_ISSUE_CODE.BROKEN_LEGACY_BLOG_LINK,
							detail: linkPath,
							file: post.sourcePath,
						},
					});
				}
				continue;
			}

			const publicAssetPath = path.join(input.publicPath, linkPath.replace(/^\//, ''));
			if (!fs.existsSync(publicAssetPath)) {
				addIssue({
					issues: input.issues,
					issue: {
						category: CONTENT_ISSUE_CATEGORY.PHYSICAL_ERROR,
						code: CONTENT_ISSUE_CODE.MISSING_PUBLIC_ASSET,
						detail: linkPath,
						file: post.sourcePath,
					},
				});
			}
		}
	}

	if (slugSet.size !== slugs.length) {
		addIssue({
			issues: input.issues,
			issue: {
				category: CONTENT_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: CONTENT_ISSUE_CODE.GLOBAL_SLUG_UNIQUENESS_CHECK_FAILED,
			},
		});
	}
}

function formatContentIssue(input: { issue: ContentIssue }) {
	const issueHeader = `[${input.issue.category}:${input.issue.code}]`;
	const issueDetail = input.issue.detail ? ` ${input.issue.detail}` : '';

	if (input.issue.file) {
		return `${issueHeader}${issueDetail}\n  ${input.issue.file}`;
	}

	return `${issueHeader}${issueDetail}`;
}

export function runContentCheck(input?: {
	contentPath?: string;
	publicPath?: string;
}): ContentCheckResult {
	const contentPath = input?.contentPath ?? CONTENT_PATH;
	const publicPath = input?.publicPath ?? path.join(process.cwd(), 'public');
	const issues: ContentIssue[] = [];

	const posts = collectPosts({ contentPath, issues });
	validateUniqueness({ issues, posts });
	validateInternalLinks({ contentPath, issues, posts, publicPath });

	return { issues, postsChecked: posts.length };
}

function main() {
	const result = runContentCheck();

	if (result.issues.length > 0) {
		console.error('\nContent validation failed.\n');
		for (const issue of result.issues) {
			console.error(`- ${formatContentIssue({ issue })}`);
		}
		process.exit(1);
	}

	console.log(`Validated ${result.postsChecked} content files successfully.`);
}

const isEntrypoint =
	process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
	main();
}
