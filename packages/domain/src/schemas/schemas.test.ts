import { describe, expect, it } from 'vite-plus/test';
import { AssetSchema, DocumentDetailSchema, DocumentSummarySchema, RecordSchema } from './index';

describe('RecordSchema', () => {
  it('accepts valid records across all status values and strips extra Convex fields', () => {
    const statuses = ['draft', 'active', 'archived'] as const;
    for (const status of statuses) {
      const parsed = RecordSchema.parse({
        _id: 'convex-id-1',
        _creationTime: 123456,
        clientId: 'rec-1',
        title: 'Patient Intake Protocol',
        category: status === 'draft' ? '' : 'clinical',
        status,
        tags: status === 'archived' ? [] : ['triage', 'intake'],
        attributes: { priority: 'high' },
        updatedAt: status === 'draft' ? 0 : 1_700_000_000_000,
      });

      expect(parsed).toEqual({
        clientId: 'rec-1',
        title: 'Patient Intake Protocol',
        category: status === 'draft' ? '' : 'clinical',
        status,
        tags: status === 'archived' ? [] : ['triage', 'intake'],
        attributes: { priority: 'high' },
        updatedAt: status === 'draft' ? 0 : 1_700_000_000_000,
      });
      expect('_id' in parsed).toBe(false);
    }
  });

  it('rejects invalid clientId, title, status, attributes, and updatedAt', () => {
    const base = {
      clientId: 'rec-1',
      title: 'Valid',
      category: 'ops',
      status: 'active',
      tags: ['a'],
      attributes: { owner: 'team' },
      updatedAt: 100,
    };

    expect(RecordSchema.safeParse({ ...base, clientId: '' }).success).toBe(false);
    expect(RecordSchema.safeParse({ ...base, title: '' }).success).toBe(false);
    expect(RecordSchema.safeParse({ ...base, status: 'deleted' }).success).toBe(false);
    expect(RecordSchema.safeParse({ ...base, updatedAt: -1 }).success).toBe(false);
    expect(RecordSchema.safeParse({ ...base, updatedAt: 1.5 }).success).toBe(false);
    expect(RecordSchema.safeParse({ ...base, attributes: { count: 42 } }).success).toBe(false);
  });
});

describe('DocumentSummarySchema & DocumentDetailSchema', () => {
  const fullDocument = {
    _id: 'doc-convex-1',
    _creationTime: 999,
    clientId: 'doc-1',
    title: 'Architecture Guide',
    slug: 'architecture-guide',
    frontmatter: { title: 'Architecture Guide', author: 'platform' },
    tags: ['architecture', 'docs'],
    ragStatus: 'indexed' as const,
    ragEntryKey: 'rag-entry-1',
    updatedAt: 1_700_000_000_000,
    markdown: '# Architecture Guide\n\nDetailed markdown content.',
    storageId: 'storage-overflow-1',
  };

  it('DocumentSummarySchema strips markdown, storageId, ragEntryKey, and Convex system fields', () => {
    const summary = DocumentSummarySchema.parse(fullDocument);

    expect(summary).toEqual({
      clientId: 'doc-1',
      title: 'Architecture Guide',
      slug: 'architecture-guide',
      frontmatter: { title: 'Architecture Guide', author: 'platform' },
      tags: ['architecture', 'docs'],
      ragStatus: 'indexed',
      updatedAt: 1_700_000_000_000,
    });
    expect('markdown' in summary).toBe(false);
    expect('storageId' in summary).toBe(false);
    expect('ragEntryKey' in summary).toBe(false);
    expect('_id' in summary).toBe(false);
  });

  it('DocumentSummarySchema rejects empty identifiers and invalid ragStatus or updatedAt', () => {
    expect(DocumentSummarySchema.safeParse({ ...fullDocument, clientId: '' }).success).toBe(false);
    expect(DocumentSummarySchema.safeParse({ ...fullDocument, title: '' }).success).toBe(false);
    expect(DocumentSummarySchema.safeParse({ ...fullDocument, slug: '' }).success).toBe(false);
    expect(DocumentSummarySchema.safeParse({ ...fullDocument, ragStatus: 'queued' }).success).toBe(
      false
    );
    expect(DocumentSummarySchema.safeParse({ ...fullDocument, updatedAt: -5 }).success).toBe(false);
  });

  it('DocumentDetailSchema preserves markdown (including empty string) and optional storageId', () => {
    const withStorage = DocumentDetailSchema.parse(fullDocument);
    expect(withStorage.markdown).toBe('# Architecture Guide\n\nDetailed markdown content.');
    expect(withStorage.storageId).toBe('storage-overflow-1');

    const emptyMarkdown = DocumentDetailSchema.parse({
      clientId: 'doc-2',
      title: 'Blank Draft',
      slug: 'blank-draft',
      frontmatter: {},
      tags: [],
      ragStatus: 'pending',
      updatedAt: 0,
      markdown: '',
    });
    expect(emptyMarkdown.markdown).toBe('');
    expect(emptyMarkdown.storageId).toBeUndefined();

    expect(DocumentDetailSchema.safeParse({ ...fullDocument, storageId: '' }).success).toBe(false);
    const { markdown: _omitted, ...withoutMarkdown } = fullDocument;
    expect(DocumentDetailSchema.safeParse(withoutMarkdown).success).toBe(false);
  });
});

describe('AssetSchema', () => {
  it('accepts minimal and full valid asset payloads', () => {
    const minimal = AssetSchema.parse({
      clientId: 'asset-1',
      filename: 'diagram.png',
      mimeType: 'image/png',
      sizeBytes: 0,
      storageId: 'storage-1',
      createdAt: 0,
    });
    expect(minimal.width).toBeUndefined();
    expect(minimal.url).toBeUndefined();

    const full = AssetSchema.parse({
      clientId: 'asset-2',
      filename: 'scan.webp',
      mimeType: 'image/webp',
      sizeBytes: 42_100,
      width: 1920,
      height: 1080,
      storageId: 'storage-2',
      url: 'https://convex.example/api/storage/storage-2',
      linkedEntityType: 'document',
      linkedEntityId: 'doc-1',
      createdAt: 1_700_000_000_000,
    });
    expect(full.linkedEntityType).toBe('document');
    expect(full.width).toBe(1920);
  });

  it('rejects invalid sizes, dimensions, empty strings, and invalid linkedEntityType', () => {
    const base = {
      clientId: 'asset-1',
      filename: 'photo.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      storageId: 'storage-1',
      createdAt: 1000,
    };

    expect(AssetSchema.safeParse({ ...base, filename: '' }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...base, mimeType: '' }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...base, storageId: '' }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...base, sizeBytes: -1 }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...base, sizeBytes: 12.5 }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...base, width: -10 }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...base, height: 100.25 }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...base, url: '' }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...base, linkedEntityType: 'asset' }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...base, linkedEntityId: '' }).success).toBe(false);
    expect(AssetSchema.safeParse({ ...base, createdAt: -1 }).success).toBe(false);
  });
});
