// fallow-ignore-file unused-file
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

export interface WalkOptions {
  readonly extensions?: readonly string[];
  readonly ignoreDirs?: readonly string[];
}

export interface PnpmWorkspaceConfig {
  readonly packages: readonly string[];
  readonly allowBuilds: Record<string, boolean | string>;
  readonly savePrefix?: string;
  readonly catalogMode?: string;
  readonly minimumReleaseAge?: string | number;
  readonly catalog: Record<string, string>;
  readonly overrides: Record<string, string>;
}

export interface EnvSchemaEntry {
  readonly name: string;
  readonly defaultValue: string;
  readonly annotations: readonly string[];
}

export interface EnvSchemaDocument {
  readonly directives: readonly string[];
  readonly entries: readonly EnvSchemaEntry[];
}

export interface BannedPropViolation {
  readonly file: string;
  readonly line: number;
  readonly component: string;
  readonly prop: string;
  readonly category: 'visual-box-model' | 'adhoc-mantine';
}

export interface ImportViolation {
  readonly file: string;
  readonly line: number;
  readonly specifier: string;
  readonly matchedRule: string;
}

export interface EnvReadViolation {
  readonly file: string;
  readonly line: number;
  readonly expression: 'import.meta.env' | 'process.env';
}

export interface CssImportViolation {
  readonly file: string;
  readonly line: number;
  readonly specifier: string;
}

export interface ProvidersCssCheckResult {
  readonly ok: boolean;
  readonly foundImports: readonly string[];
  readonly hasBannedStyleCss: boolean;
  readonly missing: readonly string[];
  readonly orderMismatch: boolean;
}

export const BANNED_MANTINE_VISUAL_PROPS = [
  'p',
  'px',
  'py',
  'pt',
  'pb',
  'pl',
  'pr',
  'm',
  'mx',
  'my',
  'mt',
  'mb',
  'ml',
  'mr',
  'c',
  'bg',
  'fz',
  'fw',
  'lh',
  'ta',
  'bd',
  'bdrs',
  'radius',
  'shadow',
  'w',
  'h',
  'miw',
  'maw',
  'mih',
  'mah',
  'pos',
  'top',
  'left',
  'right',
  'bottom',
  'display',
  'opacity',
  'style',
  'styles',
] as const;

export const BANNED_MANTINE_ADHOC_PROPS = ['variant', 'color', 'size', 'gap'] as const;

export const EXPECTED_PROVIDERS_CSS_ORDER = [
  '@mantine/core/styles.css',
  '@mantine/notifications/styles.css',
  '@mantine/dropzone/styles.css',
  '@mantine/lightbox/styles.css',
  '@blocknote/mantine/blocknoteStyles.css',
  '@repo/ui/styles',
] as const;

const DEFAULT_IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '_generated',
  '.tanstack',
  '.vitest',
  '.fallow',
]);

const BANNED_VISUAL_SET = new Set<string>(BANNED_MANTINE_VISUAL_PROPS);
const BANNED_ADHOC_SET = new Set<string>(BANNED_MANTINE_ADHOC_PROPS);

export function getRepoRoot(overrideRoot?: string): string {
  if (overrideRoot) {
    return resolve(overrideRoot);
  }
  return resolve(import.meta.dirname, '../../..');
}

export function repoPath(...segments: string[]): string {
  return resolve(getRepoRoot(), ...segments);
}

export function existsInRepo(...segments: string[]): boolean {
  return existsSync(repoPath(...segments));
}

export function readTextFile(absPath: string): string {
  return readFileSync(absPath, 'utf8');
}

export function readRepoText(...segments: string[]): string {
  return readTextFile(repoPath(...segments));
}

export function sha256File(absPath: string): string {
  const bytes = readFileSync(absPath);
  return createHash('sha256').update(bytes).digest('hex').toUpperCase();
}

export function walkFiles(dirPath: string, options?: WalkOptions): string[] {
  if (!existsSync(dirPath)) {
    return [];
  }
  const ignoreSet = new Set(options?.ignoreDirs ?? DEFAULT_IGNORE_DIRS);
  const extSet = options?.extensions ? new Set(options.extensions) : null;
  const results: string[] = [];

  function visit(currentDir: string): void {
    const entries = readdirSync(currentDir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoreSet.has(entry.name)) {
          visit(fullPath);
        }
        continue;
      }
      if (entry.isFile()) {
        if (extSet === null || extSet.has(extname(entry.name))) {
          results.push(fullPath);
        }
      }
    }
  }

  visit(dirPath);
  return results;
}

export function parseJsonc<T = unknown>(raw: string): T {
  let noComments = '';
  let inString = false;
  let escaped = false;
  let i = 0;

  while (i < raw.length) {
    const ch = raw[i];
    const next = raw[i + 1];

    if (inString) {
      noComments += ch;
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      i += 1;
      continue;
    }

    if (ch === '"') {
      inString = true;
      noComments += ch;
      i += 1;
      continue;
    }

    if (ch === '/' && next === '/') {
      i += 2;
      while (i < raw.length && raw[i] !== '\n') {
        i += 1;
      }
      continue;
    }

    if (ch === '/' && next === '*') {
      i += 2;
      while (i < raw.length && !(raw[i] === '*' && raw[i + 1] === '/')) {
        if (raw[i] === '\n') {
          noComments += '\n';
        }
        i += 1;
      }
      i += 2;
      continue;
    }

    noComments += ch;
    i += 1;
  }

  let noTrailingCommas = '';
  inString = false;
  escaped = false;
  let j = 0;

  while (j < noComments.length) {
    const ch = noComments[j];
    if (inString) {
      noTrailingCommas += ch;
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      j += 1;
      continue;
    }

    if (ch === '"') {
      inString = true;
      noTrailingCommas += ch;
      j += 1;
      continue;
    }

    if (ch === ',') {
      let k = j + 1;
      while (k < noComments.length && /\s/.test(noComments[k])) {
        k += 1;
      }
      if (noComments[k] === '}' || noComments[k] === ']') {
        j += 1;
        continue;
      }
    }

    noTrailingCommas += ch;
    j += 1;
  }

  return JSON.parse(noTrailingCommas) as T;
}

function stripYamlComment(line: string): string {
  let quote: '"' | "'" | null = null;
  let escaped = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote !== null) {
      if (quote === '"' && escaped) {
        escaped = false;
      } else if (quote === '"' && ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i);
    }
  }
  return line;
}

function unquoteYamlScalar(rawValue: string): string {
  const trimmed = rawValue.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2)
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function splitFirstColon(line: string): { key: string; value: string; hasValue: boolean } | null {
  let quote: '"' | "'" | null = null;
  let escaped = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quote !== null) {
      if (quote === '"' && escaped) {
        escaped = false;
      } else if (quote === '"' && ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === ':' && (i + 1 === line.length || /\s/.test(line[i + 1]))) {
      const rawVal = line.slice(i + 1).trim();
      return {
        key: unquoteYamlScalar(line.slice(0, i)),
        value: unquoteYamlScalar(rawVal),
        hasValue: rawVal !== '',
      };
    }
  }
  return null;
}

export function parsePnpmWorkspaceYaml(raw: string): PnpmWorkspaceConfig {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const packages: string[] = [];
  const allowBuilds: Record<string, boolean | string> = {};
  const catalog: Record<string, string> = {};
  const overrides: Record<string, string> = {};

  let savePrefix: string | undefined;
  let catalogMode: string | undefined;
  let minimumReleaseAge: string | number | undefined;
  let currentSection: string | null = null;

  for (const rawLine of lines) {
    const stripped = stripYamlComment(rawLine).trimEnd();
    if (stripped.trim() === '') {
      continue;
    }

    const indent = stripped.length - stripped.trimStart().length;
    const content = stripped.trim();

    if (indent === 0) {
      const pair = splitFirstColon(content);
      if (!pair) {
        continue;
      }
      if (!pair.hasValue) {
        currentSection = pair.key;
      } else {
        currentSection = null;
        if (pair.key === 'savePrefix') {
          savePrefix = pair.value;
        } else if (pair.key === 'catalogMode') {
          catalogMode = pair.value;
        } else if (pair.key === 'minimumReleaseAge') {
          const num = Number(pair.value);
          minimumReleaseAge = Number.isNaN(num) ? pair.value : num;
        }
      }
      continue;
    }

    if (currentSection === 'packages' && content.startsWith('-')) {
      packages.push(unquoteYamlScalar(content.slice(1)));
      continue;
    }

    const entryPair = splitFirstColon(content);
    if (!entryPair) {
      continue;
    }

    if (currentSection === 'allowBuilds') {
      if (entryPair.value === 'true') {
        allowBuilds[entryPair.key] = true;
      } else if (entryPair.value === 'false') {
        allowBuilds[entryPair.key] = false;
      } else {
        allowBuilds[entryPair.key] = entryPair.value;
      }
    } else if (currentSection === 'catalog') {
      catalog[entryPair.key] = entryPair.value;
    } else if (currentSection === 'overrides') {
      overrides[entryPair.key] = entryPair.value;
    }
  }

  return {
    packages,
    allowBuilds,
    savePrefix,
    catalogMode,
    minimumReleaseAge,
    catalog,
    overrides,
  };
}

function extractAnnotationsFromComment(commentBody: string): string[] {
  const matches = commentBody.match(/@[A-Za-z0-9_]+(?:\([^)]*\)|=[^\s]+)?/g);
  return matches ?? [];
}

export function parseEnvSchema(raw: string): EnvSchemaDocument {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  const directives: string[] = [];
  const entries: EnvSchemaEntry[] = [];
  let pendingAnnotations: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed === '') {
      pendingAnnotations = [];
      continue;
    }

    if (trimmed.startsWith('#')) {
      const commentBody = trimmed.slice(1).trim();
      if (/^-{3,}$/.test(commentBody)) {
        pendingAnnotations = [];
        continue;
      }
      const annotations = extractAnnotationsFromComment(commentBody);
      for (const annotation of annotations) {
        if (
          annotation.startsWith('@defaultRequired') ||
          annotation.startsWith('@defaultSensitive') ||
          annotation.startsWith('@generateTsTypes')
        ) {
          directives.push(annotation);
        } else {
          pendingAnnotations.push(annotation);
        }
      }
      continue;
    }

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const name = trimmed.slice(0, eqIdx).trim();
      const rhs = trimmed.slice(eqIdx + 1);
      const inlineHashIdx = rhs.indexOf('#');
      const valuePart = inlineHashIdx >= 0 ? rhs.slice(0, inlineHashIdx).trim() : rhs.trim();
      const inlineAnnotations =
        inlineHashIdx >= 0 ? extractAnnotationsFromComment(rhs.slice(inlineHashIdx + 1)) : [];

      entries.push({
        name,
        defaultValue: valuePart,
        annotations: [...pendingAnnotations, ...inlineAnnotations],
      });
      pendingAnnotations = [];
    }
  }

  return { directives, entries };
}

function maskJsCommentsPreserveStrings(source: string): string {
  const out: string[] = [];
  let i = 0;
  let state: 'code' | 'single' | 'double' | 'template' | 'lineComment' | 'blockComment' = 'code';
  let escaped = false;

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') {
        state = 'code';
        out.push('\n');
      } else {
        out.push(' ');
      }
      i += 1;
      continue;
    }

    if (state === 'blockComment') {
      if (ch === '*' && next === '/') {
        out.push(' ', ' ');
        i += 2;
        state = 'code';
        continue;
      }
      out.push(ch === '\n' ? '\n' : ' ');
      i += 1;
      continue;
    }

    if (state === 'single' || state === 'double' || state === 'template') {
      out.push(ch);
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (
        (state === 'single' && ch === "'") ||
        (state === 'double' && ch === '"') ||
        (state === 'template' && ch === '`')
      ) {
        state = 'code';
      }
      i += 1;
      continue;
    }

    if (ch === '/' && next === '/') {
      out.push(' ', ' ');
      i += 2;
      state = 'lineComment';
      continue;
    }

    if (ch === '/' && next === '*') {
      out.push(' ', ' ');
      i += 2;
      state = 'blockComment';
      continue;
    }

    if (ch === "'") {
      state = 'single';
    } else if (ch === '"') {
      state = 'double';
    } else if (ch === '`') {
      state = 'template';
    }

    out.push(ch);
    i += 1;
  }

  return out.join('');
}

function maskJsxComments(source: string): string {
  return source.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, (match) => match.replace(/[^\n]/g, ' '));
}

function lineNumberAt(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (text[i] === '\n') {
      line += 1;
    }
  }
  return line;
}

function matchesPackageRule(specifier: string, rule: string): boolean {
  if (rule.endsWith('/*')) {
    return specifier.startsWith(rule.slice(0, -1));
  }
  return specifier === rule || specifier.startsWith(`${rule}/`);
}

export function scanForbiddenImports(
  files: readonly string[],
  forbiddenRules: readonly string[]
): ImportViolation[] {
  const violations: ImportViolation[] = [];
  const patterns = [
    /\bimport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bexport\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];

  for (const file of files) {
    const cleaned = maskJsCommentsPreserveStrings(readTextFile(file));
    const seen = new Set<string>();

    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match = pattern.exec(cleaned);
      while (match !== null) {
        const specifier = match[1];
        const line = lineNumberAt(cleaned, match.index);
        for (const rule of forbiddenRules) {
          if (matchesPackageRule(specifier, rule)) {
            const key = `${line}:${specifier}:${rule}`;
            if (!seen.has(key)) {
              seen.add(key);
              violations.push({ file, line, specifier, matchedRule: rule });
            }
          }
        }
        match = pattern.exec(cleaned);
      }
    }
  }

  return violations.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

interface ComponentClassification {
  readonly mantineComponents: Set<string>;
  readonly mantineNamespaces: Set<string>;
  readonly uiPrimitives: Set<string>;
  readonly uiNamespaces: Set<string>;
}

function collectMantineAndUiImports(cleanedSource: string): ComponentClassification {
  const mantineComponents = new Set<string>();
  const mantineNamespaces = new Set<string>();
  const uiPrimitives = new Set<string>();
  const uiNamespaces = new Set<string>();

  const importRegex = /\bimport\s+(?!type\b)([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  let match = importRegex.exec(cleanedSource);

  while (match !== null) {
    const clause = match[1].trim();
    const specifier = match[2];
    const isMantine = specifier.startsWith('@mantine/');
    const isUi = specifier === '@repo/ui' || specifier.startsWith('@repo/ui/');

    if (!isMantine && !isUi) {
      match = importRegex.exec(cleanedSource);
      continue;
    }

    const nsMatch = clause.match(/^(?:[A-Za-z_$][\w$]*\s*,\s*)?\*\s+as\s+([A-Za-z_$][\w$]*)/);
    if (nsMatch) {
      if (isMantine) {
        mantineNamespaces.add(nsMatch[1]);
      } else {
        uiNamespaces.add(nsMatch[1]);
      }
    }

    const braceMatch = clause.match(/\{([\s\S]*?)\}/);
    if (braceMatch) {
      const specifiers = braceMatch[1].split(',');
      for (const rawSpec of specifiers) {
        const trimmed = rawSpec.trim();
        if (trimmed === '' || trimmed.startsWith('type ')) {
          continue;
        }
        const aliasParts = trimmed.split(/\s+as\s+/);
        const localName = (aliasParts[1] ?? aliasParts[0]).trim();
        if (localName !== '') {
          if (isMantine) {
            mantineComponents.add(localName);
          } else {
            uiPrimitives.add(localName);
          }
        }
      }
    }

    const defaultPart = clause.split('{')[0].split('*')[0].replace(/,/g, '').trim();
    if (/^[A-Za-z_$][\w$]*$/.test(defaultPart)) {
      if (isMantine) {
        mantineComponents.add(defaultPart);
      } else {
        uiPrimitives.add(defaultPart);
      }
    }

    match = importRegex.exec(cleanedSource);
  }

  return { mantineComponents, mantineNamespaces, uiPrimitives, uiNamespaces };
}

function isValidJsxStartContext(source: string, ltIndex: number): boolean {
  let idx = ltIndex - 1;
  while (idx >= 0 && /\s/.test(source[idx])) {
    idx -= 1;
  }
  if (idx < 0) {
    return true;
  }
  const prevChar = source[idx];
  if ('({[:,?=>!&|;'.includes(prevChar)) {
    return true;
  }
  if (/[A-Za-z0-9_$]/.test(prevChar)) {
    let start = idx;
    while (start > 0 && /[A-Za-z0-9_$]/.test(source[start - 1])) {
      start -= 1;
    }
    const word = source.slice(start, idx + 1);
    return (
      word === 'return' ||
      word === 'yield' ||
      word === 'await' ||
      word === 'else' ||
      word === 'case' ||
      word === 'default' ||
      word === 'throw' ||
      word === 'do'
    );
  }
  return false;
}

function skipJsString(source: string, startIdx: number, quote: "'" | '"' | '`'): number {
  let i = startIdx + 1;
  let escaped = false;
  while (i < source.length) {
    const ch = source[i];
    if (escaped) {
      escaped = false;
    } else if (ch === '\\') {
      escaped = true;
    } else if (ch === quote) {
      return i + 1;
    }
    i += 1;
  }
  return i;
}

function extractOpeningTagAttrs(source: string, tagEndIdx: number): string[] {
  const attrs: string[] = [];
  let i = tagEndIdx;
  let braceDepth = 0;

  while (i < source.length) {
    const ch = source[i];

    if (ch === "'" || ch === '"' || ch === '`') {
      i = skipJsString(source, i, ch);
      continue;
    }

    if (ch === '{') {
      braceDepth += 1;
      i += 1;
      continue;
    }

    if (ch === '}') {
      if (braceDepth > 0) {
        braceDepth -= 1;
      }
      i += 1;
      continue;
    }

    if (braceDepth === 0) {
      if (ch === '>') {
        break;
      }
      if (ch === '/' && source[i + 1] === '>') {
        break;
      }
      if (/[a-zA-Z_]/.test(ch)) {
        const start = i;
        while (i < source.length && /[a-zA-Z0-9_-]/.test(source[i])) {
          i += 1;
        }
        const attrName = source.slice(start, i);
        let look = i;
        while (look < source.length && /\s/.test(source[look])) {
          look += 1;
        }
        const nextChar = source[look];
        if (
          nextChar === '=' ||
          nextChar === '>' ||
          nextChar === '/' ||
          /[a-zA-Z_{]/.test(nextChar ?? '')
        ) {
          attrs.push(attrName);
        }
        continue;
      }
    }

    i += 1;
  }

  return attrs;
}

export function scanBannedMantineProps(files: readonly string[]): BannedPropViolation[] {
  const violations: BannedPropViolation[] = [];

  for (const file of files) {
    if (file.endsWith('.d.ts')) {
      continue;
    }

    const raw = readTextFile(file);
    const cleaned = maskJsxComments(maskJsCommentsPreserveStrings(raw));
    const imports = collectMantineAndUiImports(cleaned);

    if (
      imports.mantineComponents.size === 0 &&
      imports.mantineNamespaces.size === 0 &&
      imports.uiPrimitives.size === 0 &&
      imports.uiNamespaces.size === 0
    ) {
      continue;
    }

    const tagRegex = /<([A-Z][A-Za-z0-9]*(?:\.[A-Z][A-Za-z0-9]*)?)(?=[\s>/])/g;
    let match = tagRegex.exec(cleaned);

    while (match !== null) {
      const tagName = match[1];
      const rootName = tagName.split('.')[0];
      const isCompound = tagName.includes('.');

      let origin: 'mantine' | 'ui' | null = null;
      if (
        imports.mantineComponents.has(rootName) ||
        (isCompound && imports.mantineNamespaces.has(rootName))
      ) {
        origin = 'mantine';
      } else if (
        imports.uiPrimitives.has(rootName) ||
        (isCompound && imports.uiNamespaces.has(rootName))
      ) {
        origin = 'ui';
      }

      if (origin !== null && isValidJsxStartContext(cleaned, match.index)) {
        const line = lineNumberAt(cleaned, match.index);
        const attrs = extractOpeningTagAttrs(cleaned, match.index + match[0].length);
        for (const prop of attrs) {
          if (BANNED_VISUAL_SET.has(prop)) {
            violations.push({
              file,
              line,
              component: tagName,
              prop,
              category: 'visual-box-model',
            });
          } else if (origin === 'mantine' && BANNED_ADHOC_SET.has(prop)) {
            violations.push({
              file,
              line,
              component: tagName,
              prop,
              category: 'adhoc-mantine',
            });
          }
        }
      }

      match = tagRegex.exec(cleaned);
    }
  }

  return violations;
}

function maskCommentsAndStaticStrings(source: string): string {
  const out: string[] = [];
  let i = 0;
  let state: 'code' | 'single' | 'double' | 'template' | 'lineComment' | 'blockComment' = 'code';
  let escaped = false;
  const templateBraceStack: number[] = [];

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (state === 'lineComment') {
      if (ch === '\n') {
        state = 'code';
        out.push('\n');
      } else {
        out.push(' ');
      }
      i += 1;
      continue;
    }

    if (state === 'blockComment') {
      if (ch === '*' && next === '/') {
        out.push(' ', ' ');
        i += 2;
        state = 'code';
        continue;
      }
      out.push(ch === '\n' ? '\n' : ' ');
      i += 1;
      continue;
    }

    if (state === 'single' || state === 'double') {
      out.push(ch === '\n' ? '\n' : ' ');
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if ((state === 'single' && ch === "'") || (state === 'double' && ch === '"')) {
        state = 'code';
      }
      i += 1;
      continue;
    }

    if (state === 'template') {
      if (escaped) {
        escaped = false;
        out.push(ch === '\n' ? '\n' : ' ');
        i += 1;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        out.push(' ');
        i += 1;
        continue;
      }
      if (ch === '$' && next === '{') {
        out.push(' ', ' ');
        templateBraceStack.push(1);
        state = 'code';
        i += 2;
        continue;
      }
      if (ch === '`') {
        out.push(' ');
        state = 'code';
        i += 1;
        continue;
      }
      out.push(ch === '\n' ? '\n' : ' ');
      i += 1;
      continue;
    }

    if (ch === '/' && next === '/') {
      out.push(' ', ' ');
      i += 2;
      state = 'lineComment';
      continue;
    }

    if (ch === '/' && next === '*') {
      out.push(' ', ' ');
      i += 2;
      state = 'blockComment';
      continue;
    }

    if (ch === "'") {
      out.push(' ');
      state = 'single';
      i += 1;
      continue;
    }

    if (ch === '"') {
      out.push(' ');
      state = 'double';
      i += 1;
      continue;
    }

    if (ch === '`') {
      out.push(' ');
      state = 'template';
      i += 1;
      continue;
    }

    if (templateBraceStack.length > 0) {
      if (ch === '{') {
        templateBraceStack[templateBraceStack.length - 1] += 1;
      } else if (ch === '}') {
        templateBraceStack[templateBraceStack.length - 1] -= 1;
        if (templateBraceStack[templateBraceStack.length - 1] === 0) {
          templateBraceStack.pop();
          out.push(' ');
          state = 'template';
          i += 1;
          continue;
        }
      }
    }

    out.push(ch);
    i += 1;
  }

  return out.join('');
}

export function scanDirectEnvReads(files: readonly string[]): EnvReadViolation[] {
  const violations: EnvReadViolation[] = [];
  const envRegex = /\b(import\.meta\.env|process\.env)\b/g;

  for (const file of files) {
    const masked = maskCommentsAndStaticStrings(readTextFile(file));
    envRegex.lastIndex = 0;
    let match = envRegex.exec(masked);
    while (match !== null) {
      violations.push({
        file,
        line: lineNumberAt(masked, match.index),
        expression: match[1] as 'import.meta.env' | 'process.env',
      });
      match = envRegex.exec(masked);
    }
  }

  return violations;
}

export function scanBlockNoteStyleCssBan(files: readonly string[]): CssImportViolation[] {
  const violations: CssImportViolation[] = [];
  const regex = /['"](@blocknote\/mantine\/style\.css)['"]/g;

  for (const file of files) {
    const cleaned = maskJsCommentsPreserveStrings(readTextFile(file));
    regex.lastIndex = 0;
    let match = regex.exec(cleaned);
    while (match !== null) {
      violations.push({
        file,
        line: lineNumberAt(cleaned, match.index),
        specifier: match[1],
      });
      match = regex.exec(cleaned);
    }
  }

  return violations;
}

export function checkProvidersCssOrder(providersFilePath: string): ProvidersCssCheckResult {
  if (!existsSync(providersFilePath)) {
    return {
      ok: false,
      foundImports: [],
      hasBannedStyleCss: false,
      missing: [...EXPECTED_PROVIDERS_CSS_ORDER],
      orderMismatch: false,
    };
  }

  const cleaned = maskJsCommentsPreserveStrings(readTextFile(providersFilePath));
  const importRegex = /\bimport\s+['"]([^'"]+)['"]/g;
  const foundImports: string[] = [];

  let match = importRegex.exec(cleaned);
  while (match !== null) {
    const specifier = match[1];
    if (specifier.endsWith('.css') || specifier === '@repo/ui/styles') {
      foundImports.push(specifier);
    }
    match = importRegex.exec(cleaned);
  }

  const hasBannedStyleCss = foundImports.includes('@blocknote/mantine/style.css');
  const missing = EXPECTED_PROVIDERS_CSS_ORDER.filter((item) => !foundImports.includes(item));

  let orderMismatch = false;
  let lastIndex = -1;
  for (const expected of EXPECTED_PROVIDERS_CSS_ORDER) {
    const idx = foundImports.indexOf(expected);
    if (idx >= 0) {
      if (idx <= lastIndex) {
        orderMismatch = true;
      }
      lastIndex = idx;
    }
  }

  const uiStylesIndex = foundImports.indexOf('@repo/ui/styles');
  if (uiStylesIndex >= 0 && uiStylesIndex !== foundImports.length - 1) {
    orderMismatch = true;
  }

  const ok = !hasBannedStyleCss && missing.length === 0 && !orderMismatch;
  return {
    ok,
    foundImports,
    hasBannedStyleCss,
    missing,
    orderMismatch,
  };
}
