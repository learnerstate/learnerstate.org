// @ts-check
import { defineConfig } from "astro/config";
import remarkMermaidBlocks from "./src/lib/remark-mermaid-blocks.mjs";

// https://astro.build/config
export default defineConfig({
  site: "https://learnerstate.org",
  output: "static",
  trailingSlash: "never",
  markdown: {
    remarkPlugins: [remarkMermaidBlocks],
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});
