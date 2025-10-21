#!/usr/bin/env node
import { parseArgs } from "./utils/parse-args.js";
import { runConfig } from "./commands/config/index.js";
import { runScan } from "./commands/scan/index.js";
import { destroy } from "./utils/destroy.js";
import {runAdd} from "./commands/add/index.js";

const cli = parseArgs(process.argv);

async function main() {
  switch (cli.command) {
    case "config":
      await runConfig(cli);
      break;
    case "scan":
      await runScan();
      break;
    case "add":
      await runAdd(cli);
      break;

    default:
      console.log("Usage: tterraform <command> [--flags]");
      console.log("Commands:");
      console.log("  config     Configure provider credentials");
      console.log("  scan       Scan for any missing keys");
      console.log("  add        Add parameter using interactive mode or non interactive mode");
      console.log("");
      console.log("  * Commands without [--flag] will start interactive mode.");
      console.log("  * Commands with [--flag] will run in non-interactive mode.");

      console.log("Supported flags:");
      console.log("  - config:    --provider  |  --access-key  |  --secret");
      console.log("  - add:       --key       |  --value       |  --overwrite");
      destroy()
      break;
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
