import fs from 'fs';
import path from 'path';

import { LOCALES, LOCALE_VALUES, type Locale } from '@/lib/i18n';
import {
	CONTENT_PATH,
	buildPostFromSource,
	getAllPosts,
	getPostByLocaleAndSlug,
	getPostBySlug,
} from '@/lib/post';
import { IPost } from '@/types/post';

const CONTENT_ISSUE_CATEGORY = {
	LOGICAL_ERROR: 'LOGICAL_ERROR',
	PHYSICAL_ERROR: 'PHYSICAL_ERROR',
} as const;

const CONTENT_ISSUE_CODE = {
	BROKEN_LEGACY_BLOG_LINK: 'BROKEN_LEGACY_BLOG_LINK',
	BROKEN_LOCALIZED_BLOG_LINK: 'BROKEN_LOCALIZED_BLOG_LINK',
	DUPLICATE_SLUG: 'DUPLICATE_SLUG',
	DUPLICATE_TRANSLATION_KEY: 'DUPLICATE_TRANSLATION_KEY',
	GLOBAL_SLUG_UNIQUENESS_CHECK_FAILED: 'GLOBAL_SLUG_UNIQUENESS_CHECK_FAILED',
	INVALID_FRONTMATTER: 'INVALID_FRONTMATTER',
	MISSING_LOCALE_DIRECTORY: 'MISSING_LOCALE_DIRECTORY',
	MISSING_PUBLIC_ASSET: 'MISSING_PUBLIC_ASSET',
} as const;

type ContentIssue = {
	category: (typeof CONTENT_ISSUE_CATEGORY)[keyof typeof CONTENT_ISSUE_CATEGORY];
	code: (typeof CONTENT_ISSUE_CODE)[keyof typeof CONTENT_ISSUE_CODE];
	detail?: string;
	file?: string;
};

type CollectedPost = { content: string; post: IPost };

const issues: ContentIssue[] = [];

function addIssue(input: ContentIssue) {
	issues.push(input);
}

function validateLocaleDirectories() {
	for (const locale of LOCALES) {
		const localeDirectory = path.join(CONTENT_PATH, locale);
		if (!fs.existsSync(localeDirectory)) {
			addIssue({
				category: CONTENT_ISSUE_CATEGORY.PHYSICAL_ERROR,
				code: CONTENT_ISSUE_CODE.MISSING_LOCALE_DIRECTORY,
				detail: localeDirectory,
			});
		}
	}
}

function collectPosts() {
	const posts: CollectedPost[] = [];

	for (const locale of LOCALES) {
		const localeDirectory = path.join(CONTENT_PATH, locale);
		if (!fs.existsSync(localeDirectory)) {
			continue;
		}

		for (const file of fs.readdirSync(localeDirectory)) {
			if (!file.endsWith('.mdx')) {
				continue;
			}

			const sourcePath = path.join(localeDirectory, file);
			const fileContents = fs.readFileSync(sourcePath, 'utf8');
			const post = buildPostFromSource({
				fileContents,
				locale,
				slug: path.basename(file, '.mdx'),
				sourcePath,
			});

			if (!post) {
				addIssue({
					category: CONTENT_ISSUE_CATEGORY.LOGICAL_ERROR,
					code: CONTENT_ISSUE_CODE.INVALID_FRONTMATTER,
					file: sourcePath,
				});
				continue;
			}

			posts.push({ content: fileContents, post });
		}
	}

	return posts;
}

function validateUniqueness(posts: CollectedPost[]) {
	const slugMap = new Map<string, string>();
	const translationKeyMap = new Map<string, string>();

	for (const { post } of posts) {
		const existingSlug = slugMap.get(post.slug);
		if (existingSlug) {
			addIssue({
				category: CONTENT_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: CONTENT_ISSUE_CODE.DUPLICATE_SLUG,
				detail: post.slug,
				file: post.sourcePath,
			});
		} else {
			slugMap.set(post.slug, post.sourcePath);
		}

		const localizedTranslationKey = `${post.locale}:${post.translationKey}`;
		const existingTranslation = translationKeyMap.get(localizedTranslationKey);
		if (existingTranslation) {
			addIssue({
				category: CONTENT_ISSUE_CATEGORY.LOGICAL_ERROR,
				code: CONTENT_ISSUE_CODE.DUPLICATE_TRANSLATION_KEY,
				detail: localizedTranslationKey,
				file: post.sourcePath,
			});
		} else {
			translationKeyMap.set(localizedTranslationKey, post.sourcePath);
		}
	}
}

function isKnownInternalRoute(linkPath: string) {
	return (
		linkPath === '/' ||
		linkPath === '/blog' ||
		linkPath === `/${LOCALE_VALUES.ENGLISH}/blog` ||
		linkPath === `/${LOCALE_VALUES.KOREAN}/blog`
	);
}

function getLocalizedSlugMatch(linkPath: string) {
	const localizedRoutePattern = new RegExp(`^\\/(${LOCALES.join('|')})\\/blog\\/([^/?#]+)$`);

	return linkPath.match(localizedRoutePattern);
}

function validateInternalLinks(posts: CollectedPost[]) {
	const allPosts = getAllPosts();
	const assetRoot = path.join(process.cwd(), 'public');
	const legacyRoutePattern = /^\/blog\/([^/?#]+)$/;
	const linkPattern = /\[[^\]]+\]\((\/[^)\s?#]+)(?:[?#][^)]+)?\)/g;

	for (const { content, post } of posts) {
		for (const match of content.matchAll(linkPattern)) {
			const linkPath = match[1];

			if (isKnownInternalRoute(linkPath)) {
				continue;
			}

			const localizedMatch = getLocalizedSlugMatch(linkPath);
			if (localizedMatch) {
				const [, locale, slug] = localizedMatch;
				const localizedPost = getPostByLocaleAndSlug({ locale: locale as Locale, slug });
				if (!localizedPost) {
					addIssue({
						category: CONTENT_ISSUE_CATEGORY.LOGICAL_ERROR,
						code: CONTENT_ISSUE_CODE.BROKEN_LOCALIZED_BLOG_LINK,
						detail: linkPath,
						file: post.sourcePath,
					});
				}
				continue;
			}

			const legacyMatch = linkPath.match(legacyRoutePattern);
			if (legacyMatch) {
				const [, slug] = legacyMatch;
				const legacyPost = getPostBySlug({ slug });
				if (!legacyPost) {
					addIssue({
						category: CONTENT_ISSUE_CATEGORY.LOGICAL_ERROR,
						code: CONTENT_ISSUE_CODE.BROKEN_LEGACY_BLOG_LINK,
						detail: linkPath,
						file: post.sourcePath,
					});
				}
				continue;
			}

			const publicAssetPath = path.join(assetRoot, linkPath.replace(/^\//, ''));
			if (!fs.existsSync(publicAssetPath)) {
				addIssue({
					category: CONTENT_ISSUE_CATEGORY.PHYSICAL_ERROR,
					code: CONTENT_ISSUE_CODE.MISSING_PUBLIC_ASSET,
					detail: linkPath,
					file: post.sourcePath,
				});
			}
		}
	}

	const slugsInContent = new Set(allPosts.map((post) => post.slug));
	if (slugsInContent.size !== allPosts.length) {
		addIssue({
			category: CONTENT_ISSUE_CATEGORY.LOGICAL_ERROR,
			code: CONTENT_ISSUE_CODE.GLOBAL_SLUG_UNIQUENESS_CHECK_FAILED,
		});
	}
}

function formatIssue(issue: ContentIssue) {
	const issueHeader = `[${issue.category}:${issue.code}]`;
	const issueDetail = issue.detail ? ` ${issue.detail}` : '';

	if (issue.file) {
		return `${issueHeader}${issueDetail}\n  ${issue.file}`;
	}

	return `${issueHeader}${issueDetail}`;
}

function main() {
	validateLocaleDirectories();

	const posts = collectPosts();
	validateUniqueness(posts);
	validateInternalLinks(posts);

	if (issues.length > 0) {
		console.error('\nContent validation failed.\n');
		for (const issue of issues) {
			console.error(`- ${formatIssue(issue)}`);
		}
		process.exit(1);
	}

	console.log(`Validated ${posts.length} content files successfully.`);
}

main();
