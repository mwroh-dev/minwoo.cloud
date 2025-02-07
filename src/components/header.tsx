'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MenuLink = ({ href, title, pathname }: { href: string; title: string; pathname: string }) => {
	const isFocus = (href: string) => {
		return href === pathname || (href !== '/' && pathname.startsWith(href));
	};

	return (
		<li>
			<Link href={href}>
				<span
					className={`
						${isFocus(href) ? 'font-bold underline' : 'text-gray-700 hover:text-blue-500'}
					`}
				>
					{title}
				</span>
			</Link>
		</li>
	);
};

function Header() {
	const pathname = usePathname();

	return (
		<header
			className="
				fixed top-0 left-0 z-50
				w-full backdrop-blur-md"
		>
			<nav className="max-w-screen-md mx-auto pl-4 md:pl-0">
				<ul className="flex justify-start space-x-6 py-2">
					<MenuLink title="Home" href="/" pathname={pathname} />
					<MenuLink title="Blog" href="/blog" pathname={pathname} />
				</ul>
			</nav>
		</header>
	);
}

export default Header;
