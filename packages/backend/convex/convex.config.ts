import rag from '@convex-dev/rag/convex.config.js';
import workpool from '@convex-dev/workpool/convex.config.js';
import { defineApp } from 'convex/server';
import { v } from 'convex/values';

const app = defineApp({
  env: {
    OPENAI_API_KEY: v.optional(v.string()),
    EMBEDDING_MODEL: v.optional(v.string()),
  },
});

app.use(rag);
app.use(workpool, { name: 'ragIndexPool' });

export default app;
