export function excerptFrom(markdown: string, maxLen = 180): string {
  const lines = markdown.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line === "---" || line.startsWith("Written by")) continue;
    const plain = line
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/`(.*?)`/g, "$1")
      .trim();
    if (!plain) continue;
    return plain.length > maxLen ? `${plain.slice(0, maxLen).trim()}…` : plain;
  }
  return "";
}

export function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
