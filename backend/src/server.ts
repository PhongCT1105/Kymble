import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig(process.env);
const app = buildApp({ config });

try {
  await app.listen({ host: config.host, port: config.port });
  console.log(`Kymble backend listening on http://${config.host}:${config.port}`);
} catch (error) {
  app.log.error(error);
  console.error(error);
  process.exitCode = 1;
}
