// Runs the dev server and a Cloudflare quick tunnel to it, so the work in
// progress can be viewed from a phone or any other device, anywhere.
// Usage: npm run dev:remote  (needs cloudflared on PATH or in ~/.cloudflared:
// winget install Cloudflare.cloudflared)
//
// The tunnel address is random, changes on every run, and works for anyone
// who has it, so share it only with people who should see unreleased work.
// Ctrl+C stops both.
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const port = process.env.PORT ?? "3000";
// cloudflared from PATH, or a standalone copy in ~/.cloudflared.
const localCopy = path.join(os.homedir(), ".cloudflared", process.platform === "win32" ? "cloudflared.exe" : "cloudflared");
const cloudflared = process.env.CLOUDFLARED ?? (existsSync(localCopy) ? localCopy : "cloudflared");
const children = [];

function run(command, args, onLine) {
  const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
  children.push(child);
  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => chunk.split(/\r?\n/).filter(Boolean).forEach(onLine));
  }
  child.on("exit", (code) => {
    console.log(`${command} exited (${code ?? "signal"}); stopping.`);
    stop();
  });
  child.on("error", (error) => {
    console.error(
      error.code === "ENOENT" && command === cloudflared
        ? "cloudflared isn't installed. Install it with: winget install Cloudflare.cloudflared"
        : `${command}: ${error.message}`,
    );
    stop();
  });
  return child;
}

function stop() {
  for (const child of children) if (child.exitCode === null) child.kill();
  process.exitCode = 1;
}
process.on("SIGINT", stop);

// Same as `npm run dev` (images first, then next dev), started with node
// directly so no shell is involved.
const node = process.execPath;
const nextBin = path.join("node_modules", "next", "dist", "bin", "next");
spawnSync(node, [path.join("scripts", "optimize-images.mjs")], { stdio: "inherit" });
run(node, [nextBin, "dev", "--port", port], (line) => console.log(`[next] ${line}`));

let announced = false;
run(cloudflared, ["tunnel", "--no-autoupdate", "--url", `http://localhost:${port}`], (line) => {
  const url = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)?.[0];
  if (url && !announced) {
    announced = true;
    console.log(`\n  Remote preview: ${url}\n  (Admin: ${url}/admin)\n`);
  } else if (/ERR|error/i.test(line)) {
    console.log(`[tunnel] ${line}`);
  }
});
