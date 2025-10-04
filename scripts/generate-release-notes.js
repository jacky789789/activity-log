#!/usr/bin/env node
const fs = require("fs");

const {
  GITHUB_OUTPUT,
  RELEASE_ENV = "dev",
  RELEASE_VERSION = "v0.0.0",
  WORKFLOW = process.env.GITHUB_WORKFLOW ?? "CI/CD Deployment Pipeline"
} = process.env;

const notes = `### ${WORKFLOW}
- Environment: ${RELEASE_ENV}
- Tag: ${RELEASE_VERSION}
- Timestamp: ${new Date().toISOString()}`;

if (GITHUB_OUTPUT) {
  fs.appendFileSync(GITHUB_OUTPUT, `notes<<EOF\n${notes}\nEOF\n`);
}

console.log(notes);
