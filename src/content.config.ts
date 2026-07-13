import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Populated at build time by scripts/fetch-spec.mjs and gitignored.
// See README.md for the build-time spec pull.
const spec = defineCollection({
  loader: glob({ pattern: "spec.md", base: "./src/content/spec-generated" }),
  schema: z.object({
    title: z.string(),
    source: z.string(),
    fetchedAt: z.string(),
  }),
});

export const collections = { spec };
