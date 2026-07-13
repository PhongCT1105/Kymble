import { loadConfig } from "../config.js";
import { buildSeed } from "../fixtures/build-seed.js";
import {
  InsforgeSdkGateway,
  seedInsforge,
} from "../repositories/insforge-crm-repository.js";

const config = loadConfig(process.env);
if (!config.insforge) {
  throw new Error(
    "INSFORGE_BASE_URL and INSFORGE_ANON_KEY are required to seed InsForge.",
  );
}

const counts = await seedInsforge(new InsforgeSdkGateway(config.insforge), buildSeed());
console.log(JSON.stringify({ seeded: true, counts }, null, 2));
