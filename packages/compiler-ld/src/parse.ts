export interface SFCBlock {
  type: 'script' | 'template' | 'style';
  content: string;
  attrs: Record<string, string | true>;
  start: number;
  end: number;
}

export interface SFCDescriptor {
  script: SFCBlock | null;
  template: SFCBlock | null;
  style: SFCBlock | null;
}

const blockRegex = /<(?<tag>script|template|style)(?<attrs>[^>]*)>([\s\S]*?)<\/\k<tag>>/g;

function parseAttrs(attrsString: string): Record<string, string | true> {
  const attrs: Record<string, string | true> = {};
  if (!attrsString) return attrs;

  const attrRegex = /([\w\-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = attrRegex.exec(attrsString))) {
    const key = match[1];
    const value = match[2] ?? match[3] ?? match[4];
    attrs[key] = value === undefined ? true : value;
  }
  return attrs;
}

export function parse(source: string): SFCDescriptor {
  const descriptor: SFCDescriptor = {
    script: null,
    template: null,
    style: null,
  };

  let match;
  while ((match = blockRegex.exec(source))) {
    const tag = match.groups?.tag as SFCBlock['type'] | undefined;

    // First, ensure the tag is valid.
    if (!tag) {
      continue;
    }

    // Then, check for duplicate blocks. This is now type-safe.
    if (descriptor[tag]) {
      continue;
    }

    const attrsString = match.groups?.attrs ?? '';
    const content = match[3] ?? '';

    descriptor[tag] = {
      type: tag,
      content: content.trim(),
      attrs: parseAttrs(attrsString),
      start: match.index,
      end: match.index + match[0].length,
    };
  }

  return descriptor;
}
