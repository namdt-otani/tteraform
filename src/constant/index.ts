import path from "path";
import os from "os";
//constant providers
export const PROVIDERS = ["aws", "azure"] as const;

export const AWS_KEYS = ["access-key", "secret", "region"] as const;
export const AZURE_KEYS = ["tenant-id", "client-id", "client-secret"] as const;
//default aws region
export const defaultRegion = "ap-southeast-1";

//directory which contain config file
export const configDir = path.join(os.homedir(), ".tteraform");

//path to config file
export const configPath = path.join(configDir, "config.json");