export type GuidanceCheckConfig = {
	codexFallbackFilenames: string[];
	codexProjectDocMaxBytes: number;
	repoRuleGlobs: string[];
	sharedPerFileLineLimit: number;
};

export const guidanceCheckConfig: GuidanceCheckConfig = {
	codexFallbackFilenames: [],
	codexProjectDocMaxBytes: 32768,
	repoRuleGlobs: ['docs/agent-rules/**/*.md'],
	sharedPerFileLineLimit: 200,
};
