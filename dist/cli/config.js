import fs from "fs";
import os from "os";
import path from "path";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
export async function runConfig(cli) {
    console.log("Configure provider credentials\n");
    const configDir = path.join(os.homedir(), ".tteraform");
    const configPath = path.join(configDir, "config.json");
    // Load existing config if available
    let existingConfig = {};
    if (fs.existsSync(configPath)) {
        try {
            const data = fs.readFileSync(configPath, "utf-8");
            existingConfig = JSON.parse(data);
        }
        catch (err) {
            console.warn("No existing config, starting fresh!");
        }
    }
    let accessKeyId = existingConfig.aws?.accessKeyId ?? "";
    let secretAccessKey = existingConfig.aws?.secretAccessKey ?? "";
    let region = existingConfig.aws?.region ?? "";
    const defaultRegion = "ap-southeast-1";
    if (cli.interactive) {
        const rl = readline.createInterface({ input, output });
        accessKeyId = await rl.question(`AWS Access Key ID (${accessKeyId || "none"}): `) || accessKeyId;
        secretAccessKey = await rl.question(`AWS Secret Access Key (${secretAccessKey || "none"}): `) || secretAccessKey;
        region = await rl.question(`AWS Region (${region ? region : `default ${defaultRegion}`}): `) || region;
        rl.close();
    }
    const config = {
        provider: "aws",
        aws: { accessKeyId, secretAccessKey, region },
    };
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Config saved at: ${configPath}`);
}
//# sourceMappingURL=config.js.map