import path from "path";
import os from "os";
//constant providers
export const PROVIDERS = ["aws", "azure"];
export const AWS_KEYS = ["access-key", "secret", "region"];
export const AZURE_KEYS = ["tenant-id", "client-id", "client-secret"];
//default aws region
export const defaultRegion = "ap-southeast-1";
//directory which contain config file
export const configDir = path.join(os.homedir(), ".tteraform");
//path to config file
export const configPath = path.join(configDir, "config.json");
//# sourceMappingURL=index.js.map