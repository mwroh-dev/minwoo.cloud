import path from 'path';
import { fileURLToPath } from 'url';

import { formatSpecIssue, runSpecsCheck } from './specs.lib';

function getArgumentValue(input: { flagName: string }) {
	const flagIndex = process.argv.findIndex(argument => argument === input.flagName);
	const argumentValue = flagIndex >= 0 ? process.argv[flagIndex + 1] : undefined;

	return argumentValue?.trim() ? argumentValue : undefined;
}

function main() {
	const changedPathsArgument = getArgumentValue({ flagName: '--files' });
	const changedPaths = changedPathsArgument
		? changedPathsArgument
				.split(',')
				.map(filePath => filePath.trim())
				.filter(Boolean)
		: undefined;
	const result = runSpecsCheck({
		baseRef: getArgumentValue({ flagName: '--base-ref' }),
		changedPaths,
		cwd: process.cwd(),
		isStaged: process.argv.includes('--staged'),
	});

	if (result.issues.length > 0) {
		console.error('\nSpecs validation failed.\n');
		for (const issue of result.issues) {
			console.error(`- ${formatSpecIssue({ issue })}`);
		}

		process.exit(1);
	}

	const baseRefSummary = result.changedPaths.baseRef ?? 'none';
	const currentSpecSummary = result.currentSpecPath ?? 'none';
	console.log(
		[
			'Specs validation passed.',
			`Current spec: ${currentSpecSummary}`,
			`Changed paths: ${result.changedPaths.paths.length}`,
			`Non-exempt changed paths: ${result.nonExemptChangedPaths.length}`,
			`Diff mode: ${result.changedPaths.mode}`,
			`Base ref: ${baseRefSummary}`,
		].join('\n'),
	);
}

const isEntrypoint =
	process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
	main();
}
