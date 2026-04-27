export type SpecsCheckConfig = {
	activeIndexPath: string;
	currentSpecField: string;
	defaultVerificationCommands: string[];
	exactExemptPaths: string[];
	exemptFileSuffixes: string[];
	exemptPathPrefixes: string[];
	legacyActiveSpecsField: string;
	requiredContextMode: string;
	requiredSections: string[];
	requiredTimestampFields: string[];
	supportedStatuses: string[];
};

export const specsCheckConfig: SpecsCheckConfig = {
	activeIndexPath: 'spec.md',
	currentSpecField: 'current_spec',
	defaultVerificationCommands: [
		'yarn check:content',
		'yarn check:specs',
		'yarn lint',
		'yarn format',
		'yarn typecheck',
		'yarn test',
		'yarn build',
		'yarn test:e2e:smoke',
	],
	exactExemptPaths: ['README.md'],
	exemptFileSuffixes: ['.snap', '.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'],
	exemptPathPrefixes: ['docs/', 'tests/'],
	legacyActiveSpecsField: 'active_specs',
	requiredContextMode: 'standalone',
	requiredSections: ['Goal', 'Non-goals', 'Scope', 'Constraints', 'Verification', 'Rollback'],
	requiredTimestampFields: ['created_at', 'updated_at'],
	supportedStatuses: ['active', 'implemented', 'merged', 'archived'],
};
