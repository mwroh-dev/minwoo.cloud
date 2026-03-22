import Link from 'next/link';

type ToggleItem = {
	active?: boolean;
	disabled?: boolean;
	href?: string;
	label: string;
};

type LanguageToggleProps = {
	items: ToggleItem[];
	label?: string;
};

export default function LanguageToggle({ items, label }: LanguageToggleProps) {
	return (
		<div className="flex flex-wrap items-center gap-3">
			{label ? (
				<span className="text-[11px] uppercase tracking-[0.24em] text-stone-500">{label}</span>
			) : null}
			<div className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white/70 p-1 shadow-[0_1px_0_rgba(28,25,23,0.04)]">
				{items.map((item) => {
					const className = `inline-flex min-w-12 items-center justify-center rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] transition-all duration-200 ${
						item.active
							? 'bg-stone-950 text-stone-50'
							: item.disabled
								? 'cursor-not-allowed text-stone-300'
								: 'text-stone-600 hover:bg-stone-100 hover:text-stone-950'
					}`;

					if (item.active || item.disabled || !item.href) {
						return (
							<span key={item.label} className={className} aria-disabled={item.disabled}>
								{item.label}
							</span>
						);
					}

					return (
						<Link key={item.label} href={item.href} className={className}>
							{item.label}
						</Link>
					);
				})}
			</div>
		</div>
	);
}
