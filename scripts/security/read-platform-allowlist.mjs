#!/usr/bin/env node
/**
 * Flatten approved platform-image allowlist entries to JSON (ADR-0018).
 * Usage: node scripts/security/read-platform-allowlist.mjs [allowlist.yaml] [image_id_filter]
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(path.join(path.dirname(fileURLToPath(import.meta.url)), "../../package.json"));
const yaml = require("js-yaml");

const allowlistPath = process.argv[2] || "docs/security/platform-image-allowlist.yaml";
const filt = process.argv[3] || "";
const data = yaml.load(fs.readFileSync(allowlistPath, "utf8"));
const out = [];
for (const img of data.images || []) {
  if (img.approval_status !== "approved") continue;
  if (filt && img.id !== filt) continue;
  out.push({
    id: img.id,
    reference: img.source.reference,
    digest: img.source.digest,
    ecr_repository: img.destination.ecr_repository,
    human_tag: String(img.destination.human_tag ?? img.source.tag),
    upstream_signature: img.upstream_signature?.status ?? "not_verified",
  });
}
process.stdout.write(JSON.stringify(out));
