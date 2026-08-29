import { createLogRecord } from "@next-gen-care/observability";

export function register() {
  const record = createLogRecord("info", "application.started", {
    component: "web",
    operation: "startup",
    outcome: "success"
  });
  console.info(JSON.stringify(record));
}
