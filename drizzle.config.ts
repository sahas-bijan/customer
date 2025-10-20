import { Config, defineConfig } from "drizzle-kit";

import fs from "fs";
import path from "path";


const getLocalD1 = () => {
    try {
        const basePath = path.resolve('.wrangler');
        const dbFile = fs
            .readdirSync(basePath, { encoding: 'utf-8', recursive: true })
            .find((f) => f.endsWith('.sqlite'));

        if (!dbFile) {
            throw new Error(`.sqlite file not found in ${basePath}`);
        }

        const url = path.resolve(basePath, dbFile);
        return url;
    } catch (err) {
        console.log(`Error  ${err}`);
    }
}

const getCredentials = () => {
    const dev = {
        dbCredentials: {
            url: getLocalD1()
        }
    }
    return dev

}

export default defineConfig({
  dialect: "sqlite",
  schema: "./worker/db/schema.ts",
  out: "./worker/db/migrations",
  ...getCredentials()
}) satisfies Config;
