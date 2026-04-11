import Link from 'next/link';

type LanguageToggleItem = {
	href?: string;
	isActive?: boolean;
	isDisabled?: boolean;
	label: string;
};

function getToggleItemClassName(item: LanguageToggleItem) {
	if (item.isActive) {
		return 'inline-flex min-w-12 items-center justify-center rounded-full bg-stone-950 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-stone-50 transition-all duration-200';
	}

	if (item.isDisabled) {
		return 'inline-flex min-w-12 items-center justify-center rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-stone-300 transition-all duration-200';
	}

	return 'inline-flex min-w-12 items-center justify-center rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-stone-600 transition-all duration-200 hover:bg-stone-100 hover:text-stone-950';
}

export default function LanguageToggle({
	items,
	label,
}: {
	items: LanguageToggleItem[];
	label?: string;
}) {
	const toggleElements = items.map((item) => {
		const className = getToggleItemClassName(item);

		if (item.isActive || item.isDisabled || !item.href) {
			return (
				<span key={item.label} className={className} aria-disabled={item.isDisabled}>
					{item.label}
				</span>
			);
		}

		return (
			<Link key={item.label} href={item.href} className={className}>
				{item.label}
			</Link>
		);
	});

	return (
		<div className="flex flex-wrap items-center gap-3">
			{label ? (
				<span className="text-[11px] uppercase tracking-[0.24em] text-stone-500">{label}</span>
			) : null}
			<div className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white/70 p-1 shadow-[0_1px_0_rgba(28,25,23,0.04)]">
				{toggleElements}
			</div>
		</div>
	);
}
