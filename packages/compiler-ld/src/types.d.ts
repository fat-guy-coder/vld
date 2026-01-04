declare module '@babel/template' {
  import type { Node } from '@babel/types';
  type TemplateBuilder<T> = (substitutions: { [placeholder: string]: Node | Node[] | string | undefined | null }) => T;

  interface TemplateOpts {
    // Add options if needed in the future
  }

  function template(code: string, opts?: TemplateOpts): TemplateBuilder<Node | Node[]>;

  namespace template {
    function statement(code: string, opts?: TemplateOpts): TemplateBuilder<t.Statement>;
    function statements(code: string, opts?: TemplateOpts): TemplateBuilder<t.Statement[]>;
    function expression(code: string, opts?: TemplateOpts): TemplateBuilder<t.Expression>;
  }

  export default template;
}

