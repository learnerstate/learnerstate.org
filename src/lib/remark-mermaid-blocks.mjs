import { visit } from "unist-util-visit";

// Turns ```mermaid fences into a raw <pre class="mermaid"> block *before*
// Shiki gets to them, so they render as diagrams instead of syntax-
// highlighted text. MermaidLoader.astro only ships mermaid.js to the client
// on pages where at least one of these blocks actually exists.
export default function remarkMermaidBlocks() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "mermaid" || index === undefined || !parent) return;
      parent.children[index] = {
        type: "html",
        value: `<pre class="mermaid">${escapeHtml(node.value)}</pre>`,
      };
    });
  };
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
