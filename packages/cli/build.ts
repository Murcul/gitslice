import * as esbuild from 'esbuild'


(async () => await esbuild.build({
  entryPoints: ['index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  platform: "node",
  banner: {
    js: "#!/usr/bin/env node"
  }
}))();