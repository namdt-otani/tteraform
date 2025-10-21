export function destroy() {
  process.stdin.destroy();
  process.exit(0);
}
