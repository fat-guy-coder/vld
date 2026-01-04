import traverse, { type NodePath } from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import template from '@babel/template';
import type { parseScript, Macro, SignalMacro, ComputedMacro, EffectMacro } from './script-parser';

const signalTemplate = template.statement(`const NAME = createSignal(VALUE);`);
const computedTemplate = template.statement(`const NAME = computed(() => VALUE);`);
const effectTemplate = template.statement(`createEffect(EFFECT_FN, DEPS);`);

export function compileScript(
  scriptAst: t.File,
  macros: ReturnType<typeof parseScript>['macros']
): string {
  const reactiveVarNames = new Set<string>(
    macros
      .filter((m): m is SignalMacro | ComputedMacro => m.type === 'signal' || m.type === 'computed')
      .map(m => m.name)
  );

  traverse(scriptAst, {
    LabeledStatement(path: NodePath<t.LabeledStatement>) {
      const macro = macros.find(
        (m): m is SignalMacro | ComputedMacro =>
          (m.type === 'signal' || m.type === 'computed') &&
          t.isExpressionStatement(path.node.body) &&
          t.isAssignmentExpression(path.node.body.expression) &&
          t.isIdentifier(path.node.body.expression.left) &&
          m.name === path.node.body.expression.left.name
      );
      if (macro) {
        if (macro.type === 'signal') {
          path.replaceWith(signalTemplate({ NAME: t.identifier(macro.name), VALUE: macro.value }));
        } else {
          path.replaceWith(computedTemplate({ NAME: t.identifier(macro.name), VALUE: macro.value }));
        }
        path.skip(); // Prevent re-visiting the newly created node
      }
    },
    ExpressionStatement(path: NodePath<t.ExpressionStatement>) {
      const expression = path.node.expression;
      if (t.isCallExpression(expression) && t.isIdentifier(expression.callee) && expression.callee.name === 'effect') {
        const effectMacro = macros.find(
          (m): m is EffectMacro => m.type === 'effect' && m.effectFn.start === expression.arguments[0]?.start
        );
        if (effectMacro) {
          path.replaceWith(effectTemplate({ EFFECT_FN: effectMacro.effectFn, DEPS: effectMacro.deps ?? t.arrayExpression([]) }));
          path.skip();
        }
      }
    },
  });

  traverse(scriptAst, {
    Identifier(path: NodePath<t.Identifier>) {
      const name = path.node.name;
      if (!reactiveVarNames.has(name)) return;

      const parent = path.parent;
      if (t.isCallExpression(parent) && parent.callee === path.node) {
        return; // This is already a call, so it's a read. Do nothing.
      }
      if (t.isMemberExpression(parent) && parent.property === path.node) {
        return; // This is a property access, not a variable read.
      }
      if (t.isObjectProperty(parent) && parent.key === path.node) {
        return; // This is an object key.
      }
      if (t.isFunctionDeclaration(parent) && parent.id === path.node) {
        return; // This is a function declaration name.
      }
      if (t.isVariableDeclarator(parent) && parent.id === path.node) {
        return; // This is a variable declaration.
      }
      if (t.isAssignmentExpression(parent) && parent.left === path.node) {
        return; // This is a write operation, handled by AssignmentExpression visitor.
      }

      path.replaceWith(t.callExpression(path.node, []));
    },
    AssignmentExpression(path: NodePath<t.AssignmentExpression>) {
      if (t.isIdentifier(path.node.left) && reactiveVarNames.has(path.node.left.name)) {
        path.replaceWith(t.callExpression(path.node.left, [path.node.right]));
      }
    },
  });

  const { code } = generate(scriptAst);
  return code;
}
