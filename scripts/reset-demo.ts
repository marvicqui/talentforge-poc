/**
 * Convenience wrapper. Equivalent to `pnpm seed -- --reset`.
 * Truncates the demo tenant tables and re-seeds everything.
 *
 * Just delegates to seed-demo.ts with the --reset flag.
 */
process.argv.push("--reset");
await import("./seed-demo");
