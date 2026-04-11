import fs from 'fs';
import path from 'path';

import { LOCALES } from '@/lib/i18n';
import {
	CONTENT_PATH,
	buildPostFromSource,
	getAllPosts,
	getPostByLocaleAndSlug,
	getPostBySlug,
} from '@/lib/post';

type Issue = {
	file?: string;
	message: string;
};

const issues: Issue[] = [];

function addIssue(message: string, file?: string) {
	issues.push({ file, message });
}

function validateLocaleDirectories() {
	for (const locale of LOCALES) {
		const localeDirectory = path.join(CONTENT_PATH, locale);
		if (!fs.existsSync(localeDirectory)) {
			addIssue(`Missing locale directory: ${localeDirectory}`);
		}
	}
}

function collectPosts() {
	const posts = [];

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
				addIssue('Invalid frontmatter or unsupported metadata shape.', sourcePath);
				continue;
			}

			posts.push({
				content: fileContents,
				post,
			});
		}
	}

	return posts;
}

function validateUniqueness(posts: ReturnType<typeof collectPosts>) {
	const slugMap = new Map<string, string>();
	const translationKeyMap = new Map<string, string>();

	for (const { post } of posts) {
		const existingSlug = slugMap.get(post.slug);
		if (existingSlug) {
			addIssue(
				`Duplicate slug "${post.slug}" detected. Legacy /blog/[slug] redirects require globally unique slugs.`,
				post.sourcePath,
			);
		} else {
			slugMap.set(post.slug, post.sourcePath);
		}

		const translationKey = `${post.locale}:${post.translationKey}`;
		const existingTranslation = translationKeyMap.get(translationKey);
		if (existingTranslation) {
			addIssue(
				`Duplicate translationKey "${post.translationKey}" detected for locale "${post.locale}".`,
				post.sourcePath,
			);
		} else {
			translationKeyMap.set(translationKey, post.sourcePath);
		}
	}
}

function isKnownInternalRoute(linkPath: string) {
	return (
		linkPath === '/' || linkPath === '/blog' || linkPath === '/en/blog' || linkPath === '/ko/blog'
	);
}

function validateInternalLinks(posts: ReturnType<typeof collectPosts>) {
	const allPosts = getAllPosts();
	const assetRoot = path.join(process.cwd(), 'public');
	const localizedRoutePattern = /^\/(en|ko)\/blog\/([^/?#]+)$/;
	const legacyRoutePattern = /^\/blog\/([^/?#]+)$/;
	const linkPattern = /\[[^\]]+\]\((\/[^)\s?#]+)(?:[?#][^)]+)?\)/g;

	for (const { content, post } of posts) {
		for (const match of content.matchAll(linkPattern)) {
			const linkPath = match[1];

			if (isKnownInternalRoute(linkPath)) {
				continue;
			}

			const localizedMatch = linkPath.match(localizedRoutePattern);
			if (localizedMatch) {
				const [, locale, slug] = localizedMatch;
				if (!getPostByLocaleAndSlug(locale as (typeof LOCALES)[number], slug)) {
					addIssue(`Broken localized blog link: ${linkPath}`, post.sourcePath);
				}
				continue;
			}

			const legacyMatch = linkPath.match(legacyRoutePattern);
			if (legacyMatch) {
				const [, slug] = legacyMatch;
				if (!getPostBySlug(slug)) {
					addIssue(`Broken legacy blog link: ${linkPath}`, post.sourcePath);
				}
				continue;
			}

			const publicAssetPath = path.join(assetRoot, linkPath.replace(/^\//, ''));
			if (!fs.existsSync(publicAssetPath)) {
				addIssue(`Unknown internal link or missing public asset: ${linkPath}`, post.sourcePath);
			}
		}
	}

	const slugsInContent = new Set(allPosts.map((post) => post.slug));
	if (slugsInContent.size !== allPosts.length) {
		addIssue('Global slug uniqueness check failed.');
	}
}

function main() {
	validateLocaleDirectories();
	const posts = collectPosts();
	validateUniqueness(posts);
	validateInternalLinks(posts);

	if (issues.length > 0) {
		console.error('\nContent validation failed.\n');
		for (const issue of issues) {
			if (issue.file) {
				console.error(`- ${issue.message}\n  ${issue.file}`);
			} else {
				console.error(`- ${issue.message}`);
			}
		}
		process.exit(1);
	}

	console.log(`Validated ${posts.length} content files successfully.`);
}

main();
