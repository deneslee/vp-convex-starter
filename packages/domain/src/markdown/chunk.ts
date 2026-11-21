export interface MarkdownChunk {
  heading: string;
  content: string;
}

interface FenceState {
  char: '`' | '~';
  length: number;
}

export function chunkMarkdownByHeadings(markdown: string): MarkdownChunk[] {
  const normalized = markdown.replace(/\r\n?/g, '\n');
  if (normalized.trim().length === 0) {
    return [];
  }

  const lines = normalized.split('\n');
  const chunks: MarkdownChunk[] = [];
  let fence: FenceState | null = null;
  let currentHeading: string | null = null;
  let contentLines: string[] = [];

  const flushSection = () => {
    const content = contentLines.join('\n').trim();
    if (currentHeading === null) {
      if (content.length > 0) {
        chunks.push({ heading: '', content });
      }
      return;
    }
    chunks.push({ heading: currentHeading, content });
  };

  for (const line of lines) {
    if (fence !== null) {
      const closeMatch = /^[ \t]*(`+|~+)[ \t]*$/.exec(line);
      if (closeMatch) {
        const marker = closeMatch[1] ?? '';
        if (marker[0] === fence.char && marker.length >= fence.length) {
          fence = null;
        }
      }
      contentLines.push(line);
      continue;
    }

    const openMatch = /^[ \t]*(`{3,}|~{3,})(.*)$/.exec(line);
    if (openMatch) {
      const marker = openMatch[1] ?? '';
      const info = openMatch[2] ?? '';
      const fenceChar = marker[0] as '`' | '~';
      if (!(fenceChar === '`' && info.includes('`'))) {
        fence = { char: fenceChar, length: marker.length };
        contentLines.push(line);
        continue;
      }
    }

    const headingMatch = /^[ ]{0,3}(#{1,6})(?:[ \t]+(.*))?$/.exec(line);
    if (headingMatch) {
      const rawText = (headingMatch[2] ?? '').trim();
      const extractedHeading = rawText.replace(/(?:^|[ \t]+)#+[ \t]*$/, '').trim();
      flushSection();
      currentHeading = extractedHeading;
      contentLines = [];
      continue;
    }

    contentLines.push(line);
  }

  flushSection();
  return chunks;
}
