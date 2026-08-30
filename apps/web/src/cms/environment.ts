const DEVELOPMENT_DATABASE_URL = "postgresql://payload:payload@127.0.0.1:5432/next_gen_care";
const DEVELOPMENT_SECRET = "development-only-secret-not-valid-for-production";

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build"
  );
}

function requiredAtRuntime(name: "DATABASE_URL" | "PAYLOAD_SECRET"): string {
  const value = process.env[name];
  if (value) return value;

  if (isProductionRuntime()) {
    throw new Error(`${name} is required for the production CMS runtime`);
  }

  return name === "DATABASE_URL" ? DEVELOPMENT_DATABASE_URL : DEVELOPMENT_SECRET;
}

export const cmsEnvironment = {
  databaseUrl: requiredAtRuntime("DATABASE_URL"),
  secret: requiredAtRuntime("PAYLOAD_SECRET"),
  serverUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
};
