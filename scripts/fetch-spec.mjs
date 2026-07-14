#!/usr/bin/env node
// Pulls SPEC.md and the example documents from the learnerstate/lsl repo at
// build time. This repo never vendors a copy of the spec — see README.md.
//
// Source resolution order:
//   1. LSL_LOCAL_PATH env var — copy from a local checkout (fast, offline,
//      used for local dev against an in-progress spec branch).
//   2. https://raw.githubusercontent.com/learnerstate/lsl/<LSL_REF>/...
//      (LSL_REF defaults to "main"). Used in CI / production builds.

import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const SPEC_OUT_DIR = path.join(root, "src/content/spec-generated");
const INTRO_OUT_DIR = path.join(root, "src/content/intro-generated");
const EXAMPLES_OUT_DIR = path.join(root, "src/content/examples-generated");
const SCHEMA_OUT_DIR = path.join(root, "public/schema/v1");

const LSL_REF = process.env.LSL_REF ?? "main";
const REMOTE_BASE = `https://raw.githubusercontent.com/learnerstate/lsl/${LSL_REF}`;
const LOCAL_PATH = process.env.LSL_LOCAL_PATH ?? null;

const FILES = {
  intro: "README.md",
  spec: "SPEC.md",
  examples: [
    "examples/README.md",
    "examples/minimal-core.yml",
    "examples/full-core-provenance.yml",
    "examples/lsl-example.json",
    "examples/federation-signed.yml",
    "examples/prompt-rendering.txt",
  ],
  schema: "schema/lsl-core.schema.json",
};

async function getContent(relPath) {
  if (LOCAL_PATH) {
    const filePath = path.join(LOCAL_PATH, relPath);
    return readFile(filePath, "utf-8");
  }
  const url = `${REMOTE_BASE}/${relPath}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
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
  const source = LOCAL_PATH ? `local:${LOCAL_PATH}` : `${REMOTE_BASE} (ref: ${LSL_REF})`;
  console.log(`[fetch-spec] pulling from ${source}`);

  await rm(SPEC_OUT_DIR, { recursive: true, force: true });
  await rm(INTRO_OUT_DIR, { recursive: true, force: true });
  await rm(EXAMPLES_OUT_DIR, { recursive: true, force: true });
  await rm(SCHEMA_OUT_DIR, { recursive: true, force: true });
  await mkdir(SPEC_OUT_DIR, { recursive: true });
  await mkdir(INTRO_OUT_DIR, { recursive: true });
  await mkdir(EXAMPLES_OUT_DIR, { recursive: true });
  await mkdir(SCHEMA_OUT_DIR, { recursive: true });
  const fetchedAt = new Date().toISOString();

  // --- README.md -> intro content-collection entry with generated frontmatter ---
  const introRaw = await getContent(FILES.intro);
  const introDoc =
    frontmatter({ title: "LSL Explainer", source, fetchedAt }) + introRaw;
  await writeFile(path.join(INTRO_OUT_DIR, "readme.md"), introDoc, "utf-8");
  console.log(`[fetch-spec] wrote README.md (${introRaw.length} bytes)`);

  // --- SPEC.md -> a content-collection entry with generated frontmatter ---
  const specRaw = await getContent(FILES.spec);
  const specDoc =
    frontmatter({ title: "LSL Specification", source, fetchedAt }) + specRaw;
  await writeFile(path.join(SPEC_OUT_DIR, "spec.md"), specDoc, "utf-8");
  console.log(`[fetch-spec] wrote SPEC.md (${specRaw.length} bytes)`);

  // --- examples ---
  for (const relPath of FILES.examples) {
    const content = await getContent(relPath);
    const outName = path.basename(relPath);
    await writeFile(path.join(EXAMPLES_OUT_DIR, outName), content, "utf-8");
    console.log(`[fetch-spec] wrote ${outName} (${content.length} bytes)`);
  }

  // --- schema -> public/schema/v1/, served at the URL its own $id declares ---
  const schemaRaw = await getContent(FILES.schema);
  const schemaOutName = path.basename(FILES.schema);
  await writeFile(path.join(SCHEMA_OUT_DIR, schemaOutName), schemaRaw, "utf-8");
  console.log(`[fetch-spec] wrote ${schemaOutName} (${schemaRaw.length} bytes)`);

  console.log("[fetch-spec] done.");
}

main().catch((err) => {
  console.error("[fetch-spec] FAILED:", err.message);
  process.exit(1);
});
