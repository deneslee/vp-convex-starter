import { useMemo, useState } from 'react';
import { api } from '@repo/backend/_generated/api';
import {
  createClientId,
  parseMarkdownFrontmatter,
  slugifyTitle,
  type DocumentSummary,
} from '@repo/domain';
import { useLiveQuery } from '@tanstack/react-db';
import { convexClient } from '../../data/clients';
import { documentSummariesCollection } from '../../data/collections';

export function useDocumentsFeature() {
  const { data: summaries } = useLiveQuery((q) => q.from({ doc: documentSummariesCollection }));
  const [filterText, setFilterText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const filteredDocuments = useMemo(() => {
    const query = filterText.trim().toLowerCase();
    return [...summaries]
      .filter((doc: DocumentSummary) => {
        if (!query) {
          return true;
        }
        return (
          doc.title.toLowerCase().includes(query) ||
          doc.slug.toLowerCase().includes(query) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [filterText, summaries]);

  const createDocument = async (titleInput: string): Promise<string | null> => {
    const title = titleInput.trim();
    if (!title) {
      return null;
    }

    const clientId = createClientId();
    const slug = `${slugifyTitle(title)}-${clientId.slice(0, 6)}`;

    await convexClient.mutation(api.documents.upsert, {
      clientId,
      title,
      slug,
      markdown: `# ${title}\n\n`,
      frontmatter: {},
      tags: [],
    });

    return slug;
  };

  const importMarkdownFiles = async (files: File[]) => {
    setIsImporting(true);
    try {
      for (const file of files) {
        const raw = await file.text();
        const parsed = parseMarkdownFrontmatter(raw);
        const fallbackTitle = file.name.replace(/\.mdx?$/i, '') || 'Untitled Document';
        const title = parsed.title || fallbackTitle;
        const clientId = createClientId();
        const slug = `${slugifyTitle(title)}-${clientId.slice(0, 6)}`;

        await convexClient.mutation(api.documents.upsert, {
          clientId,
          title,
          slug,
          markdown: parsed.body,
          frontmatter: parsed.frontmatter,
          tags: parsed.tags,
        });
      }
    } finally {
      setIsImporting(false);
    }
  };

  const deleteDocument = (clientId: string) => {
    documentSummariesCollection.delete(clientId);
  };

  return {
    documents: filteredDocuments,
    filterText,
    isImporting,
    setFilterText,
    createDocument,
    importMarkdownFiles,
    deleteDocument,
  };
}
