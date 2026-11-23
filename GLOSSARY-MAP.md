# Glossary Map

## Contexts

- [Records](docs/domain/records/GLOSSARY.md) defines the structured items tracked in the workspace.
- [Documents](docs/domain/documents/GLOSSARY.md) defines authored Markdown and the two views of a Document.
- [Assets](docs/domain/assets/GLOSSARY.md) defines the files users upload and reuse.
- [Search](docs/domain/search/GLOSSARY.md) defines how workspace content is found.

## Relationships

- **Assets → Records and Documents**: An Asset can be linked to a Record or a Document.
- **Search → Records and Documents**: Keyword Search can find Records and Documents. Semantic Search can find Document passages.
- **Documents → Search**: A Document’s Indexing Status tells readers whether it is ready for Semantic Search.
