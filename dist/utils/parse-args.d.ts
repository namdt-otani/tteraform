export interface CLIArgs {
    command?: string;
    flags: Record<string, boolean | string>;
    interactive: boolean;
}
export declare function parseArgs(argv: string[]): CLIArgs;
//# sourceMappingURL=parse-args.d.ts.map