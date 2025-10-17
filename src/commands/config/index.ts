import fs from "fs";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import type { CLIArgs } from "../../utils/parse-args.js";
import {AWS_KEYS, AZURE_KEYS, configDir, configPath, defaultRegion, PROVIDERS} from "../../constant/index.js";

// ---------- TYPES ----------
type Provider = (typeof PROVIDERS)[number];
type AwsFlagKey = (typeof AWS_KEYS)[number];
type AzureFlagKey = (typeof AZURE_KEYS)[number];

type AwsProviderConf = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};

type AzureProviderConf = {
  tenantId: string;
  clientId: string;
  clientSecret: string;
};

interface MetaProviders {
  aws?: AwsProviderConf;
  azure?: AzureProviderConf;
}

interface Config {
  provider?: Provider;
  metaProvider?: MetaProviders;
}

// ---------- GLOBALS ----------
const rl = readline.createInterface({ input, output });

// ---------- HELPERS ----------
const FlagsMap: Record<string, string> = {
  "access-key": "accessKeyId",
  "serect": "secretAccessKey",
  "region": "region",
  "tenant-id": "tenantId",
  "client-id": "clientId",
  "client-secret": "clientSecret"
}
// Load existing config file if available
export function loadConfig(): Config {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (e) {
    console.warn("⚠️ Failed to parse existing config file:", e);
  }
  return {}; // default empty config
}

// Save config to ~/.tteraform/config.json
function saveConfig(conf: Config) {
  fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(conf, null, 2));
  console.log(`Config saved at: ${configPath}`);
  process.stdin.destroy();
  process.exit(0);
}

// Prompt with default value support
async function ask(question: string, def?: string): Promise<string> {
  const q = def ? `${question} (${def}): ` : `${question}: `;
  const ans = await rl.question(q);
  return ans.trim() || def || "";
}

async function configProvider(conf: Config): Promise<Provider> {
  while (true) {
    const provider = (await ask("Choose provider (aws | azure)", conf.provider)).trim() as Provider;
    if (PROVIDERS.includes(provider)) {
      return provider;
    }
    console.log(`Invalid provider: "${provider}". Must be one of ${PROVIDERS.join(", ")}`);
  }
}

// ---------- MAIN LOGIC ----------

async function runConfigInteractive() {
  console.log("Interactive configuration mode\n");
  const conf = loadConfig();

  // Choose provider
  const provider = await configProvider(conf);

  // Configure provider config accordingly
  const metaProvider: MetaProviders = { ...conf.metaProvider };

  if (provider === "aws") {
    const accessKeyId = await ask("AWS Access Key ID", metaProvider?.aws?.accessKeyId);
    const secretAccessKey = await ask("AWS Secret Access Key",  metaProvider?.aws?.secretAccessKey);
    const region = await ask("AWS Region", metaProvider?.aws?.region || defaultRegion);
    metaProvider.aws = { accessKeyId, secretAccessKey, region };
  }
  else if (provider === "azure") {
    const tenantId = await ask("Azure Tenant ID", metaProvider?.azure?.tenantId);
    const clientSecret = await ask("Azure Client Secret Key",  metaProvider?.azure?.clientSecret);
    const clientId = await ask("AWS Client Id", metaProvider?.azure?.clientId);
    metaProvider.azure = { tenantId, clientSecret, clientId };
  }

  const newConf: Config = { provider, metaProvider };
  saveConfig(newConf);

  console.log(`Config updated for provider '${provider}'`);
}

async function runConfigNoInteractive(cli: CLIArgs) {
  const conf = loadConfig();
  const flags = cli.flags;
  const provider = flags["provider"] as Provider;

  if (!PROVIDERS.includes(provider)) {
    throw new Error(`Invalid provider: ${provider}. Must be one of ${PROVIDERS.join(", ")}`);
  }

  const validKeys = provider === "aws" ? AWS_KEYS : AZURE_KEYS;
  const metaProvider: MetaProviders = { ...conf.metaProvider };

  // Validate flags and map key
  const normalized: Record<string, string> = {};
  for (const [flag, value] of Object.entries(flags)) {
    if (flag === "provider") continue;
    // @ts-ignore
    if (!validKeys.includes(flag)) {
      throw new Error(`Invalid flag for provider '${provider}': --${flag}`);
    }

    const mappedKey = FlagsMap[flag];
    if (!mappedKey) {
      throw new Error(`Unknown mapping for flag: --${flag}`);
    }

    normalized[mappedKey] = value as string;
  }

  if (provider === "aws") {
    metaProvider.aws = {
      accessKeyId: normalized.accessKeyId ?? metaProvider.aws?.accessKeyId ?? "",
      secretAccessKey: normalized.secretAccessKey ?? metaProvider.aws?.secretAccessKey ?? "",
      region: normalized.region ?? metaProvider.aws?.region ?? defaultRegion,
    };
  } else if (provider === "azure") {
    metaProvider.azure = {
      tenantId: normalized.tenantId ?? metaProvider.azure?.tenantId ?? "",
      clientId: normalized.clientId ?? metaProvider.azure?.clientId ?? "",
      clientSecret: normalized.clientSecret ?? metaProvider.azure?.clientSecret ?? "",
    };
  }

  const newConf: Config = { provider, metaProvider };
  saveConfig(newConf);
  console.log(`Config updated for provider '${provider}'`);
}

// ---------- ENTRY POINT ----------

export async function runConfig(cli: CLIArgs) {
  const hasFlags = Object.keys(cli.flags).length > 0;
  if (hasFlags) {
    await runConfigNoInteractive(cli);
    return;
  }
  // fallback interactive
  await  runConfigInteractive();
  return;
}
