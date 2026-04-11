'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { DEFAULT_LOCALE, getLocaleBlogPath, SITE_COPY } from '@/lib/i18n';
import { HOME_PATH } from '@/lib/site';

const MenuLink = ({ href, pathname, title }: { href: string; pathname: string; title: string }) => {
	const isFocus = (href: string) => {
		const defaultBlogPath = getLocaleBlogPath(DEFAULT_LOCALE);

		if (href === defaultBlogPath) {
			return pathname.includes(defaultBlogPath);
		}

		return href === pathname || (href !== HOME_PATH && pathname.startsWith(href));
	};

	return (
		<li className="text-xs uppercase tracking-[0.24em]">
			<Link
				href={href}
				className={`inline-flex rounded-full px-3 py-1.5 transition-all duration-200 ${
					isFocus(href)
						? 'bg-stone-950 text-stone-50'
						: 'text-stone-500 hover:bg-white/70 hover:text-stone-950'
				}`}
			>
				{title}
			</Link>
		</li>
	);
};

function Header() {
	const pathname = usePathname();
	const defaultHeaderCopy = SITE_COPY[DEFAULT_LOCALE].header;

	return (
		<header
			className="
				sticky top-0 z-50
				border-b border-stone-200/80 bg-[rgba(246,242,234,0.84)] backdrop-blur-xl"
		>
			<nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
				<Link href={HOME_PATH} className="rounded-full px-2 py-1 font-serif text-xl text-stone-950">
					Minwoo Roh
				</Link>
				<ul className="flex justify-start space-x-6">
					<MenuLink title={defaultHeaderCopy.homeLabel} href={HOME_PATH} pathname={pathname} />
					<MenuLink
						title={defaultHeaderCopy.writingsLabel}
						href={getLocaleBlogPath(DEFAULT_LOCALE)}
						pathname={pathname}
					/>
				</ul>
			</nav>
		</header>
	);
}

export default Header;
