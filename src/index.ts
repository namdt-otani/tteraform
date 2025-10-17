#!/usr/bin/env node
import { parseArgs } from "./utils/parse-args.js";
import { runConfig } from "./commands/config/index.js";

const cli = parseArgs(process.argv);

async function main() {
  console.log(process.argv)
  console.log(cli)
  switch (cli.command) {
    case "config":
      await runConfig(cli);
      break;

    default:
      console.log("Usage: tteraform <command> [--flags]");
      console.log("Commands:");
      console.log("  config     Configure provider credentials");
      console.log("\nGlobal flags:");
      console.log("  --interactive / --no-interactive");
      break;
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
