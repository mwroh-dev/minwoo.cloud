"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MenuLink = ({
  href,
  title,
  pathname,
}: {
  href: string;
  title: string;
  pathname: string;
}) => {

const isFocus = (href: string) => {
  return href === pathname || (href !== '/' && pathname.startsWith(href));
}

  return (
    <li>
      <Link href={href}>
        <span className={`${isFocus(href) && 'font-bold underline'}`}>
          {title}
        </span>
      </Link>
    </li>
  );
}

function Header() {
    const pathname = usePathname();

    return (
      <header>
        <nav>
          <ul className="flex space-x-4">
            <MenuLink title="Home" href="/" pathname={pathname} />
            <MenuLink title="Blog" href="/blog" pathname={pathname} />
          </ul>
        </nav>
      </header>
    )
}

export default Header;