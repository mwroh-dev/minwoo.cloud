import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

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
				if (
					currentNode.arguments.some((argument) => hasObjectArgument(unwrapExpression(argument)))
				) {
					return true;
				}

				return currentNode.arguments.some((argument) => containsObjectArgumentCall(argument));
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
				return currentNode.expressions.some((expression) => containsObjectArgumentCall(expression));
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

const eslintConfig = [
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	{
		plugins: {
			local: {
				rules: { 'mechanically-editable-control-flow': mechanicallyEditableControlFlowRule },
			},
		},
		rules: { 'local/mechanically-editable-control-flow': 'error' },
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
		],
	},
];

export default eslintConfig;
