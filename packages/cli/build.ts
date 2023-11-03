import * as esbuild from "esbuild";

(async () =>
  await esbuild.build({
    entryPoints: ["cli.ts"],
    bundle: true,
    outfile: "dist/cli.js",
    platform: "node",
    banner: {
      js: "#!/usr/bin/env node",
    },
  }))();
