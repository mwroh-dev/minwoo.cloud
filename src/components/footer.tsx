import { Github, LinkedinIcon } from 'lucide-react';
import Link from 'next/link';

function Footer() {
  return (
    <footer className="w-full text-center mt-auto pt-6">
      <div className="flex items-center justify-center gap-2">
        <Link href="https://github.com/mwroh-dev" target="_blank">
          <Github size={14} />
        </Link>
        <Link href="https://www.linkedin.com/in/cieloroh/" target="_blank">
          <LinkedinIcon size={14} />
        </Link>
      </div>
      <span className="text-xs">
        Copyright © 2025 Minwoo.Roh
      </span>
    </footer>
  );
}

export default Footer;