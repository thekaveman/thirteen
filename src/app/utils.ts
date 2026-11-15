/**
 * Logs a message with a timestamp.
 * @param data The data to log.
 */
export function log(...data: unknown[]): void {
  // This is the base logging function, so it directly uses console.log
  data = [`${new Date().toLocaleString()}`, ...data];
  console.log(...data);
}
