export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getAppConfig } = await import("server/appConfig");
    try {
      await getAppConfig();
    } catch (e) {
      // Next.js does not exit on register() errors, so we must do it ourselves.
      console.error(e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  }
}
