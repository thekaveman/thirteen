/**
 * Logs a message with a timestamp.
 * @param {string} message The message to log.
 */
export function log(...data) {
  // This is the base logging function, so it directly uses console.log
  data = [`${new Date().toLocaleString()}`, ...data];
  console.log(...data);
}
