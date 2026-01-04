import * as parser from '@babel/parser';
import * as t from '@babel/types';

// Define more specific types for each macro
export interface SignalMacro {
  type: 'signal';
  name: string;
  value: t.Expression;
}

export interface ComputedMacro {
  type: 'computed';
  name: string;
  value: t.Expression;
}

export interface EffectMacro {
  type: 'effect';
  // The main function to be executed as a side effect.
  effectFn: t.ArrowFunctionExpression | t.FunctionExpression;
  // The optional dependency array.
  deps: t.ArrayExpression | undefined;
}

export type Macro = SignalMacro | ComputedMacro | EffectMacro;

/**
 * @description Parses the <script> content to find and extract V5 compile-time macros.
 * @param scriptContent - The source code from the <script> block.
 * @returns An object containing the extracted macros and the AST.
 */
export function parseScript(scriptContent: string) {
  const ast = parser.parse(scriptContent, {
    sourceType: 'module',
    plugins: ['typescript'], // Enable TypeScript parsing
  });

  const macros: Macro[] = [];

  // Traverse the AST to find our macros
  for (const node of ast.program.body) {
    // Handle s: and c: macros (LabeledStatements)
    if (t.isLabeledStatement(node)) {
      const label = node.label.name;
      if (
        (label === 'signal' || label === 's' || label === 'computed' || label === 'c') &&
        t.isExpressionStatement(node.body) &&
        t.isAssignmentExpression(node.body.expression) &&
        t.isIdentifier(node.body.expression.left)
      ) {
        macros.push({
          type: label === 'signal' || label === 's' ? 'signal' : 'computed',
          name: node.body.expression.left.name,
          value: node.body.expression.right,
        });
      }
    } 
    // Handle effect() macro (CallExpressions)
    else if (
      t.isExpressionStatement(node) &&
      t.isCallExpression(node.expression) &&
      t.isIdentifier(node.expression.callee) &&
      node.expression.callee.name === 'effect'
    ) {
      const effectFn = node.expression.arguments[0];
      const depsArray = node.expression.arguments[1];

      if (effectFn && (t.isArrowFunctionExpression(effectFn) || t.isFunctionExpression(effectFn))) {
        macros.push({
          type: 'effect',
          effectFn,
          deps: t.isArrayExpression(depsArray) ? depsArray : undefined,
        });
      }
    }
  }

  return {
    ast,
    macros,
  };
}
