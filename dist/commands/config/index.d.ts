import type { CLIArgs } from "../../utils/parse-args.js";
import { PROVIDERS } from "../../constant/index.js";
type Provider = (typeof PROVIDERS)[number];
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
export declare function loadConfig(): Config;
export declare function runConfig(cli: CLIArgs): Promise<void>;
export {};
//# sourceMappingURL=index.d.ts.map