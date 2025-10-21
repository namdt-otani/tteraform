import { execSync } from "child_process";
import { destroy } from "../../utils/destroy.js";

/**
 * Wrapper cho `terraform plan -json` để phát hiện missing SSM parameters.
 */
export async function runScan() {
  try {
    console.log("🧠 Running terraform plan -json ...");
    const output = execSync("terraform plan -no-color -input=false -json", {
      encoding: "utf-8",
    });

    const lines = output.split(/\r?\n/).filter(Boolean);
    const missingKeys = [];

    for (const line of lines) {
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }

      // Nếu là diagnostic lỗi "No configuration files" → dừng luôn
      if (entry?.diagnostic?.summary?.includes("No configuration files")) {
        console.error(
          "Terraform error: No configuration files found.\n" +
          "Hint: Run this command inside a directory that contains .tf files."
        );
        destroy();
        return;
      }

      // Bỏ qua những dòng không chứa lỗi
      if (entry["@level"] !== "error" && entry?.diagnostic?.severity !== "error")
        continue;

      const text =
        entry["@message"] ||
        entry?.diagnostic?.summary ||
        entry?.diagnostic?.detail ||
        "";

      // Regex tìm lỗi thiếu parameter
      const match =
        text.match(/(?:SSM|Parameter).*['"]?([^'"\s]+)['"]?.*not found/i) ||
        text.match(/parameter\s+['"]?([^'"\s]+)['"]?\s+not found/i) ||
        text.match(/ParameterNotFound.*?([^\s]+)/i);

      if (match) missingKeys.push(match[1]);
    }

    const uniq = Array.from(new Set(missingKeys));

    if (uniq.length === 0) {
      console.log("No missing SSM parameters found!");
      destroy();
      return;
    }

    console.log("\n🚨 Missing SSM Parameters detected:\n");
    for (const key of uniq) console.log(`  - ${key}`);

    console.log("\nYou can add them using:");
    for (const key of uniq) {
      console.log(`  tterraform add --key=${key} --value=<value>`);
    }

    destroy();
  } catch (err: any) {
    console.error("terraform plan -json failed:", err.message || err);
    console.error(
      "Hint: ensure you ran `terraform init` and are in the correct Terraform directory."
    );
    destroy();
  }
}
