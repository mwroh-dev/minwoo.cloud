import { Github, LinkedinIcon } from 'lucide-react';
import Link from 'next/link';

function Footer() {
  return (
    <footer className="w-full text-center mt-auto">
      <div className="flex items-center justify-center gap-2">
        <Link href="" target="_blank">
          <Github size={14} />
        </Link>
        <Link href="" target="_blank">
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