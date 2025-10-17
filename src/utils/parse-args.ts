export interface CLIArgs {
  command?: string;
  subcommand?: string;
  flags: Record<string, boolean | string>;
  interactive: boolean;
}

export function parseArgs(argv: string[]): CLIArgs {
  const args = argv.slice(2);
  const flags: Record<string, boolean | string> = {};
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const [key, value] = arg.split("=");
      const flagName = key.replace(/^--/, "");
      flags[flagName] = value ?? true;
    } else {
      positional.push(arg);
    }
  }

  let interactive = Object.keys(flags).length === 0;

  // Allow explicit overrides
  if ("interactive" in flags) interactive = true;
  if ("no-interactive" in flags) interactive = false;

  return {
    command: positional[0],
    subcommand: positional[1],
    flags,
    interactive,
  };
}
