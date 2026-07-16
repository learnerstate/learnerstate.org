#!/usr/bin/env node
// Pulls blog posts from the learnerstate/Resources repo's `blogs/` folder at
// build time. Mirrors fetch-spec.mjs's approach — this repo never vendors a
// copy of that content, see README.md.
//
// Source resolution order:
//   1. RESOURCES_LOCAL_PATH env var — copy from a local checkout (fast,
//      offline, used for local dev against an in-progress Resources branch).
//   2. GitHub API + raw.githubusercontent.com for
//      https://github.com/learnerstate/Resources (RESOURCES_REF defaults to
//      "main"). Used in CI / production builds.

import { mkdir, writeFile, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const BLOGS_OUT_DIR = path.join(root, "src/content/blogs-generated");

const RESOURCES_REF = process.env.RESOURCES_REF ?? "main";
const RESOURCES_REPO = "learnerstate/Resources";
const RAW_BASE = `https://raw.githubusercontent.com/${RESOURCES_REPO}/${RESOURCES_REF}`;
const API_BASE = `https://api.github.com/repos/${RESOURCES_REPO}/contents`;
const LOCAL_PATH = process.env.RESOURCES_LOCAL_PATH ?? null;

async function listLocalBlogFiles() {
  const dir = path.join(LOCAL_PATH, "blogs");
  const entries = await readdir(dir);
  return entries.filter((name) => name.endsWith(".md"));
}

async function listRemoteBlogFiles() {
  const res = await fetch(`${API_BASE}/blogs?ref=${RESOURCES_REF}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to list blogs/ via GitHub API: ${res.status} ${res.statusText}`);
  }
  const entries = await res.json();
  return entries
    .filter((entry) => entry.type === "file" && entry.name.endsWith(".md"))
    .map((entry) => entry.name);
}

async function getContent(relPath) {
  if (LOCAL_PATH) {
    return readFile(path.join(LOCAL_PATH, relPath), "utf-8");
  }
  const url = `${RAW_BASE}/${relPath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

function slugify(filename) {
  return filename.replace(/\.md$/, "");
}

function titleFromContent(raw, fallbackSlug) {
  const heading = raw.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  return fallbackSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function frontmatter(fields) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(fields)) {
    lines.push(`${key}: ${JSON.stringify(value)}`);
  }
  lines.push("---", "");
  return lines.join("\n");
}

async function main() {
  const source = LOCAL_PATH
    ? `local:${LOCAL_PATH}`
    : `https://github.com/${RESOURCES_REPO} (ref: ${RESOURCES_REF})`;
  console.log(`[fetch-resources] pulling blogs from ${source}`);

  await rm(BLOGS_OUT_DIR, { recursive: true, force: true });
  await mkdir(BLOGS_OUT_DIR, { recursive: true });

  const fetchedAt = new Date().toISOString();
  const filenames = LOCAL_PATH ? await listLocalBlogFiles() : await listRemoteBlogFiles();

  for (const filename of filenames) {
    const raw = await getContent(`blogs/${filename}`);
    const slug = slugify(filename);
    const title = titleFromContent(raw, slug);
    const doc = frontmatter({ title, slug, source, fetchedAt }) + raw;
    await writeFile(path.join(BLOGS_OUT_DIR, filename), doc, "utf-8");
    console.log(`[fetch-resources] wrote ${filename} (${raw.length} bytes)`);
  }

  console.log(`[fetch-resources] done (${filenames.length} post(s)).`);
}

main().catch((err) => {
  console.error("[fetch-resources] FAILED:", err.message);
  process.exit(1);
});
