'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MenuLink = ({ href, title, pathname }: { href: string; title: string; pathname: string }) => {
	const isFocus = (href: string) => {
		if (href === '/blog') {
			return pathname === href || /\/blog(\/|$)/.test(pathname);
		}

		return href === pathname || (href !== '/' && pathname.startsWith(href));
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

	return (
		<header
			className="
				sticky top-0 z-50
				border-b border-stone-200/80 bg-[rgba(246,242,234,0.84)] backdrop-blur-xl"
		>
			<nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
				<Link href="/" className="rounded-full px-2 py-1 font-serif text-xl text-stone-950">
					Minwoo Roh
				</Link>
				<ul className="flex justify-start space-x-6">
					<MenuLink title="Home" href="/" pathname={pathname} />
					<MenuLink title="Writings" href="/blog" pathname={pathname} />
				</ul>
			</nav>
		</header>
	);
}

export default Header;
