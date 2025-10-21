import { SSMClient, PutParameterCommand, PutParameterCommandInput } from "@aws-sdk/client-ssm";
import { loadConfig } from "../config/index.js";
import type { CLIArgs } from "../../utils/parse-args.js";
import {destroy} from "../../utils/destroy.js";

async function runAddNoInteractive(cli: CLIArgs) {
  const { flags } = cli;
  const key = flags["key"];
  const value = flags["value"];
  const overwrite = flags["overwrite"] === true || flags["overwrite"] === "true";

  if (!key || !value) {
    console.error("Missing required flags: --key and --value");
    destroy();
    return;
  }

  const conf = loadConfig();
  const provider = conf.provider;
  if (provider !== "aws") {
    console.error(`Unsupported provider: ${provider}.`);
    console.error(`Hint: Run tterraform config --provider=aws`);
    destroy();
    return;
  }

  const aws = conf.metaProvider?.aws;
  if (!aws || !aws?.accessKeyId || !aws?.secretAccessKey) {
    console.error("Missing AWS credentials. Run 'tterraform config' first.");
    destroy();
    return;
  }

  const client = new SSMClient({
    region: aws.region,
    credentials: {
      accessKeyId: aws.accessKeyId,
      secretAccessKey: aws.secretAccessKey,
    },
  });

  try {
    const input = {
      Name: String(key),
      Value: String(value),
      Type: "String",
      Overwrite: overwrite,
    } as PutParameterCommandInput;

    const cmd = new PutParameterCommand(input);

    const result = await client.send(cmd);
    console.log(`Added parameter: ${key}`);
    console.log(`Version: ${result.Version}`);
  } catch (err: any) {
    if (err.name === "ParameterAlreadyExists") {
      console.error(`Parameter already exists: ${key}`);
      console.error(`Hint: you can use --overwrite in add command.`);
    } else {
      console.error("Failed to add parameter:", err.message);
    }
  }
}

async function runAddInteractive() {
  console.log("Interactive add parameter mode\n");
  destroy();
}

export async function runAdd(cli: CLIArgs) {
  const hasFlags = Object.keys(cli.flags).length > 0;
  if (hasFlags) {
    await runAddNoInteractive(cli);
    return;
  }
  // fallback interactive
  await  runAddInteractive();
  return;
}
