import Link from 'next/link';
import { Github, LinkedinIcon } from 'lucide-react';

import { DEFAULT_LOCALE, SITE_COPY } from '@/lib/i18n';
import { GITHUB_PROFILE_URL, LINKEDIN_PROFILE_URL } from '@/lib/site';

function Footer() {
	const defaultFooterCopy = SITE_COPY[DEFAULT_LOCALE].footer;
	const externalRel = 'noopener noreferrer';

	return (
		<footer className="mt-auto border-t border-stone-200 px-6 py-8 sm:px-8">
			<div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-stone-500 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="font-serif text-xl text-stone-950">{defaultFooterCopy.title}</p>
					<p className="mt-1 max-w-md leading-6">{defaultFooterCopy.description}</p>
				</div>
				<div className="space-y-3">
					<div className="flex items-center justify-start gap-3 sm:justify-end">
						<Link
							href={GITHUB_PROFILE_URL}
							target="_blank"
							rel={externalRel}
							aria-label={defaultFooterCopy.githubAriaLabel}
						>
							<Github size={16} />
						</Link>
						<Link
							href={LINKEDIN_PROFILE_URL}
							target="_blank"
							rel={externalRel}
							aria-label={defaultFooterCopy.linkedinAriaLabel}
						>
							<LinkedinIcon size={16} />
						</Link>
					</div>
					<p className="text-xs uppercase tracking-[0.18em]">{defaultFooterCopy.copyright}</p>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
