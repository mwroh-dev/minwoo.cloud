import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const mechanicallyEditableControlFlowRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'require object-argument lookups to be extracted before branch conditions',
		},
		schema: [],
		messages: {
			extractLookup:
				'Extract object-argument lookups into a named const before branching so the control flow stays mechanically editable.',
		},
	},
	create(context) {
		function unwrapExpression(node) {
			let currentNode = node;

			while (currentNode) {
				if (currentNode.type === 'ChainExpression') {
					currentNode = currentNode.expression;
					continue;
				}

				if (
					currentNode.type === 'ParenthesizedExpression' ||
					currentNode.type === 'TSAsExpression' ||
					currentNode.type === 'TSTypeAssertion' ||
					currentNode.type === 'TSNonNullExpression'
				) {
					currentNode = currentNode.expression;
					continue;
				}

				return currentNode;
			}

			return currentNode;
		}

		function hasObjectArgument(node) {
			return node && node.type === 'ObjectExpression';
		}

		function containsObjectArgumentCall(node) {
			const currentNode = unwrapExpression(node);

			if (!currentNode) {
				return false;
			}

			if (currentNode.type === 'CallExpression') {
				if (currentNode.arguments.some(argument => hasObjectArgument(unwrapExpression(argument)))) {
					return true;
				}

				return currentNode.arguments.some(argument => containsObjectArgumentCall(argument));
			}

			if (currentNode.type === 'UnaryExpression' || currentNode.type === 'AwaitExpression') {
				return containsObjectArgumentCall(currentNode.argument);
			}

			if (
				currentNode.type === 'BinaryExpression' ||
				currentNode.type === 'LogicalExpression' ||
				currentNode.type === 'AssignmentExpression'
			) {
				return (
					containsObjectArgumentCall(currentNode.left) ||
					containsObjectArgumentCall(currentNode.right)
				);
			}

			if (currentNode.type === 'ConditionalExpression') {
				return (
					containsObjectArgumentCall(currentNode.test) ||
					containsObjectArgumentCall(currentNode.consequent) ||
					containsObjectArgumentCall(currentNode.alternate)
				);
			}

			if (currentNode.type === 'MemberExpression') {
				return (
					containsObjectArgumentCall(currentNode.object) ||
					(currentNode.computed && containsObjectArgumentCall(currentNode.property))
				);
			}

			if (currentNode.type === 'SequenceExpression') {
				return currentNode.expressions.some(expression => containsObjectArgumentCall(expression));
			}

			return false;
		}

		return {
			IfStatement(node) {
				if (!containsObjectArgumentCall(node.test)) {
					return;
				}

				context.report({ node: node.test, messageId: 'extractLookup' });
			},
		};
	},
};

const noRawGuidanceFileKindRule = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'disallow raw GuidanceFileKind literals outside the shared constant object',
		},
		schema: [],
		messages: {
			preferSharedKind:
				'Use GUIDANCE_FILE_KIND instead of repeating raw guidance file kind literals.',
		},
	},
	create(context) {
		const filename = (context.filename ?? context.getFilename()).replaceAll('\\', '/');
		if (!filename.endsWith('/scripts/check-guidance.ts')) {
			return {};
		}

		const guidanceFileKinds = new Set(['claudeFile', 'claudeRule', 'codexFile', 'repoRule']);

		function isGuidanceFileKindDefinition(node) {
			if (node.parent?.type !== 'Property' || node.parent.value !== node) {
				return false;
			}

			const objectExpression = node.parent.parent;
			if (objectExpression?.type !== 'ObjectExpression') {
				return false;
			}

			let currentParent = objectExpression.parent;
			if (currentParent?.type === 'TSAsExpression') {
				currentParent = currentParent.parent;
			}

			const variableDeclarator = currentParent;
			return (
				variableDeclarator?.type === 'VariableDeclarator' &&
				variableDeclarator.id.type === 'Identifier' &&
				variableDeclarator.id.name === 'GUIDANCE_FILE_KIND'
			);
		}

		return {
			Literal(node) {
				if (typeof node.value !== 'string' || !guidanceFileKinds.has(node.value)) {
					return;
				}

				if (isGuidanceFileKindDefinition(node)) {
					return;
				}

				context.report({ node, messageId: 'preferSharedKind' });
			},
		};
	},
};

const eslintConfig = [
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	{
		plugins: {
			import: importPlugin,
			local: {
				rules: {
					'mechanically-editable-control-flow': mechanicallyEditableControlFlowRule,
					'no-raw-guidance-file-kind': noRawGuidanceFileKindRule,
				},
			},
		},
		rules: {
			'arrow-parens': ['error', 'as-needed'],
			curly: ['error', 'multi-line'],
			'import/no-unused-modules': [
				'error',
				{
					ignoreUnusedTypeExports: false,
					ignoreExports: ['src/app/**/*.ts', 'src/app/**/*.tsx', 'src/components/**/*.tsx'],
					src: [
						'scripts/**/*.ts',
						'src/app/**/*.ts',
						'src/app/**/*.tsx',
						'src/components/**/*.tsx',
						'src/lib/**/*.ts',
						'src/types/**/*.ts',
						'tests/unit/**/*.ts',
					],
					unusedExports: true,
				},
			],
			'local/mechanically-editable-control-flow': 'error',
			'local/no-raw-guidance-file-kind': 'error',
		},
	},
	{
		ignores: [
			'node_modules',
			'.next',
			'out',
			'dist',
			'public',
			'coverage',
			'playwright-report',
			'test-results',
			'.claude',
			'.omx',
			'.superpowers',
			'.husky/_',
			'next-env.d.ts',
		],
	},
];

export default eslintConfig;
