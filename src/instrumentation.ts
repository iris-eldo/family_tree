// Next.js instrumentation hook — runs once on server startup.
// Used to initialize Sentry on the server side via the Next.js-native path
// rather than relying solely on sentry.server.config.ts.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
}
