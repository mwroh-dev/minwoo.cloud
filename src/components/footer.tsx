import { Github, LinkedinIcon } from 'lucide-react';
import Link from 'next/link';

function Footer() {
	return (
		<footer className="mt-auto border-t border-stone-200 px-6 py-8 sm:px-8">
			<div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-stone-500 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="font-serif text-xl text-stone-950">Cielo.dev</p>
					<p className="mt-1 max-w-md leading-6">
						Editorial notes on software craft, career durability, and building with AI-native
						tools.
					</p>
				</div>
				<div className="space-y-3">
					<div className="flex items-center justify-start gap-3 sm:justify-end">
						<Link href="https://github.com/mwroh-dev" target="_blank" aria-label="GitHub">
							<Github size={16} />
						</Link>
						<Link
							href="https://www.linkedin.com/in/cieloroh/"
							target="_blank"
							aria-label="LinkedIn"
						>
							<LinkedinIcon size={16} />
						</Link>
					</div>
					<p className="text-xs uppercase tracking-[0.18em]">Copyright © 2026 Minwoo Roh</p>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
