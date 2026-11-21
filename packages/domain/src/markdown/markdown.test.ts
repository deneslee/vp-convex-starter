import { describe, expect, it } from 'vite-plus/test';
import { chunkMarkdownByHeadings, parseMarkdownFrontmatter, slugifyTitle } from './index';

describe('parseMarkdownFrontmatter', () => {
  it('extracts title, tags, custom frontmatter keys, and strips leading blank lines from body', () => {
    const raw = [
      '---',
      'title: Clinical Triage Notes',
      'author: Dr. Lee',
      'tags: [triage, emergency]',
      '---',
      '',
      '',
      '# Heading',
      '',
      'Body paragraph.',
    ].join('\n');

    const result = parseMarkdownFrontmatter(raw);
    expect(result).toEqual({
      frontmatter: {
        title: 'Clinical Triage Notes',
        author: 'Dr. Lee',
        tags: 'triage, emergency',
      },
      body: '# Heading\n\nBody paragraph.',
      title: 'Clinical Triage Notes',
      tags: ['triage', 'emergency'],
    });
  });

  it('normalizes UTF-8 BOM and CRLF line endings', () => {
    const raw = '\uFEFF---\r\ntitle: "BOM Doc"\r\ntags: alpha, beta\r\n---\r\n\r\nContent line\r\n';
    const result = parseMarkdownFrontmatter(raw);
    expect(result).toEqual({
      frontmatter: {
        title: 'BOM Doc',
        tags: 'alpha, beta',
      },
      body: 'Content line\n',
      title: 'BOM Doc',
      tags: ['alpha', 'beta'],
    });
  });

  it('supports ... closing delimiter and empty frontmatter block', () => {
    const withDots = '---\ntitle: Dot End\n...\nBody here';
    expect(parseMarkdownFrontmatter(withDots)).toEqual({
      frontmatter: { title: 'Dot End' },
      body: 'Body here',
      title: 'Dot End',
      tags: [],
    });

    const emptyFm = '---\n---\n\nJust body';
    expect(parseMarkdownFrontmatter(emptyFm)).toEqual({
      frontmatter: {},
      body: 'Just body',
      tags: [],
    });
  });

  it('returns normalized body with empty frontmatter when opening delimiter is missing or unclosed', () => {
    const noFm = '# Plain Doc\r\n\r\nNo frontmatter.';
    expect(parseMarkdownFrontmatter(noFm)).toEqual({
      frontmatter: {},
      body: '# Plain Doc\n\nNo frontmatter.',
      tags: [],
    });

    const unclosed = '---\ntitle: Never Closed\n\n# Still Body';
    expect(parseMarkdownFrontmatter(unclosed)).toEqual({
      frontmatter: {},
      body: '---\ntitle: Never Closed\n\n# Still Body',
      tags: [],
    });
  });

  it('handles quoted values, escaped quotes, colons in values, inline comments, and empty values', () => {
    const raw = [
      '---',
      'title: "Hello: \\"World\\"" # trailing comment',
      "subtitle: 'It''s fine'",
      'url: https://example.com:8443/path#anchor',
      'draft:',
      '---',
      'Body',
    ].join('\n');

    const result = parseMarkdownFrontmatter(raw);
    expect(result.title).toBe('Hello: "World"');
    expect(result.frontmatter).toEqual({
      title: 'Hello: "World"',
      subtitle: "It's fine",
      url: 'https://example.com:8443/path#anchor',
      draft: '',
    });
  });

  it('supports inline, multiline, comma-separated, single, empty, and duplicate tags', () => {
    const multiline = ['---', 'tags:', '  - alpha', '  - "beta"', '  - alpha', '---', 'Body'].join(
      '\n'
    );
    expect(parseMarkdownFrontmatter(multiline).tags).toEqual(['alpha', 'beta']);
    expect(parseMarkdownFrontmatter(multiline).frontmatter.tags).toBe('alpha, beta');

    const inlineQuoted = '---\ntags: ["a, b", c, \'c\']\n---\nBody';
    expect(parseMarkdownFrontmatter(inlineQuoted).tags).toEqual(['a, b', 'c']);

    const single = '---\ntags: solo\n---\nBody';
    expect(parseMarkdownFrontmatter(single).tags).toEqual(['solo']);

    const emptyArray = '---\ntags: []\n---\nBody';
    expect(parseMarkdownFrontmatter(emptyArray).tags).toEqual([]);
    expect(parseMarkdownFrontmatter(emptyArray).frontmatter.tags).toBe('');

    const emptyKey = '---\ntags:\n---\nBody';
    expect(parseMarkdownFrontmatter(emptyKey).tags).toEqual([]);
    expect(parseMarkdownFrontmatter(emptyKey).frontmatter.tags).toBe('');
  });

  it('leaves title undefined when frontmatter title is blank whitespace', () => {
    const raw = '---\ntitle: "   "\n---\nBody';
    const result = parseMarkdownFrontmatter(raw);
    expect(result.title).toBeUndefined();
  });
});

describe('chunkMarkdownByHeadings', () => {
  it('returns empty array for empty or whitespace-only input', () => {
    expect(chunkMarkdownByHeadings('')).toEqual([]);
    expect(chunkMarkdownByHeadings('   \r\n\t\n  ')).toEqual([]);
  });

  it('returns single empty-heading chunk when document has no headings', () => {
    expect(chunkMarkdownByHeadings('Intro line 1\r\nIntro line 2\r\n')).toEqual([
      { heading: '', content: 'Intro line 1\nIntro line 2' },
    ]);
  });

  it('captures preamble before first heading and preserves empty heading sections', () => {
    const md = [
      'Preamble text.',
      '',
      '# Parent',
      '## Child',
      'Child body.',
      '###### Deepest',
      'Deep body.',
    ].join('\n');

    expect(chunkMarkdownByHeadings(md)).toEqual([
      { heading: '', content: 'Preamble text.' },
      { heading: 'Parent', content: '' },
      { heading: 'Child', content: 'Child body.' },
      { heading: 'Deepest', content: 'Deep body.' },
    ]);
  });

  it('strips optional ATX closing hashes while keeping C# and #hashtag intact', () => {
    const md = [
      '## Title ##  ',
      'Body 1',
      '## C#',
      'Body 2',
      '#hashtag is not a heading',
      '####### 7 hashes is not a heading',
      '    # 4-space indented is not a heading',
    ].join('\n');

    expect(chunkMarkdownByHeadings(md)).toEqual([
      { heading: 'Title', content: 'Body 1' },
      {
        heading: 'C#',
        content: [
          'Body 2',
          '#hashtag is not a heading',
          '####### 7 hashes is not a heading',
          '    # 4-space indented is not a heading',
        ].join('\n'),
      },
    ]);
  });

  it('does not split on # comments inside backtick, tilde, or nested fenced code blocks', () => {
    const md = [
      '# Setup',
      '```bash',
      '# bash comment should not split',
      '## also inside fence',
      'echo ok',
      '```',
      '',
      '~~~python',
      '# python comment',
      '~~~',
      '',
      '````md',
      '```ts',
      '# nested fence comment',
      '```',
      '# still inside outer 4-backtick fence',
      '````',
      '',
      '## Next Section',
      'After fences.',
    ].join('\n');

    expect(chunkMarkdownByHeadings(md)).toEqual([
      {
        heading: 'Setup',
        content: [
          '```bash',
          '# bash comment should not split',
          '## also inside fence',
          'echo ok',
          '```',
          '',
          '~~~python',
          '# python comment',
          '~~~',
          '',
          '````md',
          '```ts',
          '# nested fence comment',
          '```',
          '# still inside outer 4-backtick fence',
          '````',
        ].join('\n'),
      },
      {
        heading: 'Next Section',
        content: 'After fences.',
      },
    ]);
  });
});

describe('slugifyTitle', () => {
  it('slugifies ASCII titles, punctuation, and repeated whitespace/hyphens', () => {
    expect(slugifyTitle('Hello World')).toBe('hello-world');
    expect(slugifyTitle('  --Hello,   World!! (v2)--  ')).toBe('hello-world-v2');
  });

  it('strips diacritics and transliterates common Latin ligatures', () => {
    expect(slugifyTitle('Café Crème — Ångström')).toBe('cafe-creme-angstrom');
    expect(slugifyTitle('Große Straße & Æther')).toBe('grosse-strasse-aether');
  });

  it('falls back to untitled when result would be empty', () => {
    expect(slugifyTitle('')).toBe('untitled');
    expect(slugifyTitle('   ')).toBe('untitled');
    expect(slugifyTitle('!!! --- ???')).toBe('untitled');
    expect(slugifyTitle('日本語 🚀')).toBe('untitled');
  });
});
