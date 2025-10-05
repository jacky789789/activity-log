#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const pkgPath = path.join(process.cwd(), "package.json");
const lockPath = path.join(process.cwd(), "package-lock.json");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const lock = JSON.parse(fs.readFileSync(lockPath, "utf8"));

const [major, minor, patch] = pkg.version.split(".").map(Number);
const next = [major, minor, patch + 1].join(".");
const tag = `v${next}`;

pkg.version = next;
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

lock.version = next;

if (!lock.packages) {
  lock.packages = {};
}

if (!lock.packages[""]) {
  lock.packages[""] = {};
}

lock.packages[""].version = next;
fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `next_tag=${tag}\n`);
}
console.log(`Next semantic version: ${tag}`);
