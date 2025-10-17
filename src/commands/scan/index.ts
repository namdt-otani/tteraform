import { execSync } from "child_process";

export async function runScan() {
  try {
    const output = execSync("terraform plan -no-color -json", { encoding: "utf-8" });
    const data = JSON.parse(output);

    const missingKeys: string[] = [];

    for (const diag of data?.diagnostics ?? []) {
      const msg = diag.summary || diag.detail || "";
      const match = msg.match(/Parameter.*not found: (.+)/i);
      if (match) missingKeys.push(match[1]);
    }

    if (missingKeys.length === 0) {
      console.log("No missing parameters found!");
      return;
    }

    console.log("Missing parameters detected:\n");
    for (const key of missingKeys) {
      console.log(`- ${key}`);
    }

    console.log("\nYou can add them using:");
    for (const key of missingKeys) {
      console.log(`  tteraform add --key=${key} --value=<your-value>`);
    }
  } catch (err: any) {
    console.error("Failed to run terraform scan:", err.message);
  }
}
