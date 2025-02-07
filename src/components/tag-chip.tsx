const defaultTagColor = 'bg-gray-300 text-gray-800';

const tagColors: Record<string, string> = {
	ReactJS: 'bg-blue-500 text-white',
	Experience: 'bg-amber-500 text-white'
};

export default function TagChip({ tag }: { tag: string }) {
	return (
		<span
			className={`
				px-3 py-1 rounded-full
				text-sm font-semibold
				${tagColors[tag] || defaultTagColor}`}
		>
			{tag}
		</span>
	);
}
