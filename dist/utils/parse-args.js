export function parseArgs(argv) {
    const args = argv.slice(2);
    const flags = {};
    const positional = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith("--")) {
            const [key, value] = arg.split("=");
            const flagName = key.replace(/^--/, "");
            flags[flagName] = value ?? true;
        }
        else {
            positional.push(arg);
        }
    }
    let interactive = Object.keys(flags).length === 0;
    // Allow explicit overrides
    if ("interactive" in flags)
        interactive = true;
    if ("no-interactive" in flags)
        interactive = false;
    return {
        command: positional[0],
        flags,
        interactive,
    };
}
//# sourceMappingURL=parse-args.js.map