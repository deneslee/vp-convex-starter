export interface ParsedMarkdownFrontmatter {
  frontmatter: Record<string, string>;
  body: string;
  title?: string;
  tags: string[];
}

function stripTrailingInlineComment(value: string): string {
  return value.replace(/[ \t]+#.*$/, '').trim();
}

function parseQuotedString(trimmed: string): string | null {
  if (trimmed.startsWith('"')) {
    let result = '';
    for (let i = 1; i < trimmed.length; i += 1) {
      const ch = trimmed[i];
      if (ch === '\\' && i + 1 < trimmed.length) {
        const next = trimmed[i + 1];
        if (next === '"' || next === '\\') {
          result = `${result}${next}`;
          i += 1;
          continue;
        }
        if (next === 'n') {
          result = `${result}\n`;
          i += 1;
          continue;
        }
        if (next === 't') {
          result = `${result}\t`;
          i += 1;
          continue;
        }
      }
      if (ch === '"') {
        const trailing = trimmed.slice(i + 1).trim();
        if (trailing.length === 0 || trailing.startsWith('#')) {
          return result;
        }
        return null;
      }
      result = `${result}${ch}`;
    }
    return null;
  }

  if (trimmed.startsWith("'")) {
    let result = '';
    for (let i = 1; i < trimmed.length; i += 1) {
      const ch = trimmed[i];
      if (ch === "'") {
        if (trimmed[i + 1] === "'") {
          result = `${result}'`;
          i += 1;
          continue;
        }
        const trailing = trimmed.slice(i + 1).trim();
        if (trailing.length === 0 || trailing.startsWith('#')) {
          return result;
        }
        return null;
      }
      result = `${result}${ch}`;
    }
    return null;
  }

  return null;
}

function parseScalarValue(rawValue: string): string {
  const trimmed = rawValue.trim();
  const quoted = parseQuotedString(trimmed);
  if (quoted !== null) {
    return quoted;
  }
  return stripTrailingInlineComment(trimmed);
}

function extractInlineArrayContent(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed.startsWith('[')) {
    return null;
  }
  let quote: '"' | "'" | null = null;
  for (let i = 1; i < trimmed.length; i += 1) {
    const ch = trimmed[i];
    if (quote === '"') {
      if (ch === '\\' && i + 1 < trimmed.length) {
        i += 1;
        continue;
      }
      if (ch === '"') {
        quote = null;
      }
      continue;
    }
    if (quote === "'") {
      if (ch === "'") {
        if (trimmed[i + 1] === "'") {
          i += 1;
          continue;
        }
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === ']') {
      const trailing = trimmed.slice(i + 1).trim();
      if (trailing.length === 0 || trailing.startsWith('#')) {
        return trimmed.slice(1, i);
      }
      return null;
    }
  }
  return null;
}

function splitInlineArrayItems(inner: string): string[] {
  const items: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (quote === '"') {
      current = `${current}${ch}`;
      if (ch === '\\' && i + 1 < inner.length) {
        i += 1;
        current = `${current}${inner[i]}`;
        continue;
      }
      if (ch === '"') {
        quote = null;
      }
      continue;
    }
    if (quote === "'") {
      current = `${current}${ch}`;
      if (ch === "'") {
        if (inner[i + 1] === "'") {
          i += 1;
          current = `${current}'`;
          continue;
        }
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current = `${current}${ch}`;
      continue;
    }
    if (ch === ',') {
      const parsed = parseScalarValue(current);
      if (parsed.length > 0) {
        items.push(parsed);
      }
      current = '';
      continue;
    }
    current = `${current}${ch}`;
  }

  const last = parseScalarValue(current);
  if (last.length > 0) {
    items.push(last);
  }
  return items;
}

function deduplicateTags(rawTags: string[]): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const rawTag of rawTags) {
    const trimmed = rawTag.trim();
    if (trimmed.length > 0 && !seen.has(trimmed)) {
      seen.add(trimmed);
      tags.push(trimmed);
    }
  }
  return tags;
}

export function parseMarkdownFrontmatter(raw: string): ParsedMarkdownFrontmatter {
  const withoutBom = raw.startsWith('\uFEFF') ? raw.slice(1) : raw;
  const normalized = withoutBom.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');

  if (!/^---[ \t]*$/.test(lines[0] ?? '')) {
    return { frontmatter: {}, body: normalized, tags: [] };
  }

  let closingIndex = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (/^(?:---|\.\.\.)[ \t]*$/.test(lines[i] ?? '')) {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex === -1) {
    return { frontmatter: {}, body: normalized, tags: [] };
  }

  const fmLines = lines.slice(1, closingIndex);
  const body = lines
    .slice(closingIndex + 1)
    .join('\n')
    .replace(/^\n+/, '');

  const frontmatter: Record<string, string> = {};
  const rawTags: string[] = [];
  let hasTagsKey = false;
  let activeListKey: string | null = null;
  let activeListItems: string[] = [];

  const flushActiveList = () => {
    if (activeListKey === null) {
      return;
    }
    if (activeListKey === 'tags') {
      rawTags.push(...activeListItems);
    } else if (activeListItems.length > 0) {
      frontmatter[activeListKey] = activeListItems.join(', ');
    }
    activeListKey = null;
    activeListItems = [];
  };

  for (const line of fmLines) {
    if (/^[ \t]*$/.test(line) || /^[ \t]*#/.test(line)) {
      continue;
    }

    if (activeListKey !== null) {
      const listItemMatch = /^[ \t]*-[ \t]*(.*)$/.exec(line);
      if (listItemMatch) {
        const parsedItem = parseScalarValue(listItemMatch[1] ?? '');
        if (parsedItem.length > 0) {
          activeListItems.push(parsedItem);
        }
        continue;
      }
    }

    flushActiveList();

    const kvMatch = /^([A-Za-z0-9_.-]+)[ \t]*:[ \t]*(.*)$/.exec(line);
    if (!kvMatch) {
      continue;
    }

    const key = kvMatch[1] ?? '';
    const rawValue = kvMatch[2] ?? '';
    const trimmedRaw = rawValue.trim();

    if (key === 'tags') {
      hasTagsKey = true;
      if (trimmedRaw.length === 0 || trimmedRaw.startsWith('#')) {
        activeListKey = 'tags';
        activeListItems = [];
        continue;
      }
      const inlineArray = extractInlineArrayContent(trimmedRaw);
      if (inlineArray !== null) {
        rawTags.push(...splitInlineArrayItems(inlineArray));
        continue;
      }
      const scalar = parseScalarValue(trimmedRaw);
      for (const part of scalar.split(',')) {
        const trimmedPart = part.trim();
        if (trimmedPart.length > 0) {
          rawTags.push(trimmedPart);
        }
      }
      continue;
    }

    if (trimmedRaw.length === 0 || trimmedRaw.startsWith('#')) {
      frontmatter[key] = '';
      activeListKey = key;
      activeListItems = [];
      continue;
    }

    const inlineArray = extractInlineArrayContent(trimmedRaw);
    if (inlineArray !== null) {
      frontmatter[key] = splitInlineArrayItems(inlineArray).join(', ');
      continue;
    }

    frontmatter[key] = parseScalarValue(trimmedRaw);
  }

  flushActiveList();

  const tags = deduplicateTags(rawTags);
  if (hasTagsKey) {
    frontmatter.tags = tags.join(', ');
  }

  const rawTitle = frontmatter.title?.trim();
  if (rawTitle && rawTitle.length > 0) {
    return {
      frontmatter,
      body,
      title: rawTitle,
      tags,
    };
  }

  return {
    frontmatter,
    body,
    tags,
  };
}
