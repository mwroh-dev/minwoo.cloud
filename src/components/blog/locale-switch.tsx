import Link from 'next/link';

import { LOCALES, LOCALE_LABEL, type Locale } from '@/lib/i18n';

type LocaleSwitchProps = {
	currentLocale?: Locale;
};

export default function LocaleSwitch({ currentLocale }: LocaleSwitchProps) {
	return (
		<nav aria-label="Language switcher">
			<ul className="flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-stone-500">
				{LOCALES.map((locale) => {
					const isActive = locale === currentLocale;

					return (
						<li key={locale}>
							<Link
								href={`/${locale}/blog`}
								className={`transition-colors duration-200 ${
									isActive ? 'text-stone-950' : 'hover:text-stone-950'
								}`}
							>
								{LOCALE_LABEL[locale]}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
