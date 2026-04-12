import path from 'path';
import { fileURLToPath } from 'url';

import { writeSpecDraft } from './specs.lib';

function getArgumentValue(input: { flagName: string }) {
	const flagIndex = process.argv.findIndex((argument) => argument === input.flagName);
	const argumentValue = flagIndex >= 0 ? process.argv[flagIndex + 1] : undefined;

	return argumentValue?.trim() ? argumentValue : undefined;
}

function main() {
	const changedPathsArgument = getArgumentValue({ flagName: '--files' });
	const changedPaths = changedPathsArgument
		? changedPathsArgument
				.split(',')
				.map((filePath) => filePath.trim())
				.filter(Boolean)
		: undefined;
	const result = writeSpecDraft({
		baseRef: getArgumentValue({ flagName: '--base-ref' }),
		changedPaths,
		cwd: process.cwd(),
		isStaged: process.argv.includes('--staged'),
		slug: getArgumentValue({ flagName: '--slug' }),
		title: getArgumentValue({ flagName: '--title' }),
	});

	console.log(
		[
			'Current branch spec created or updated.',
			`Spec file: ${result.specFilePath}`,
			`Detected changed paths: ${result.changedPaths.length}`,
		].join('\n'),
	);
}

const isEntrypoint =
	process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
	main();
}
