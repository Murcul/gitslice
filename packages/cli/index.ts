import { Command, Option } from "commander";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { gitslice } from "@gitslice/ignore";

const program = new Command();
program
  .name("gitslice")
  .description("CLI frontend for the gitslice library")
  .version("0.0.0")
  .addOption(
    new Option("-m, --mode <mode>", "Whether to run in ignore or slice mode")
      .default("ignore")
      .choices(["ignore", "slice"]),
  )
  .option(
    "-c, --config <pathToConfig>",
    "path to gitslice config",
    "./git-slice.json",
  )
  .option(
    "-r, --repo <repoPath>",
    "Where the repo you want to run gitslice on is",
    ".",
  );

program.parse();

const options = program.opts();

const schema = z.object({
  mode: z.enum(["ignore", "slice"]),
  config: z.string(),
  repo: z.string(),
});

const parsedOptions = schema.safeParse(options);

if (!parsedOptions.success) {
  console.log(parsedOptions.error.errors[0].message);
  process.exit(0);
}
const configPath = path.isAbsolute(parsedOptions.data.config)
  ? parsedOptions.data.config
  : path.join(process.cwd(), parsedOptions.data.config);

if (!fs.existsSync(configPath)) {
  console.log(
    `${parsedOptions.data.config}: config file not found. Specify config with -c`,
  );
  process.exit(1);
}

const repoPath = path.isAbsolute(parsedOptions.data.repo)
  ? parsedOptions.data.repo
  : path.join(process.cwd(), parsedOptions.data.repo);

if (!fs.existsSync(repoPath)) {
  console.log(
    `${parsedOptions.data.repo}: repo folder not found. Specify repo with -r`,
  );
  process.exit(1);
}

const main = async () => {
  const config = JSON.parse(
    fs.readFileSync(configPath, {
      encoding: "utf-8",
    }),
  );
  const configSchema = z.object({
    folders: z
      .string({
        required_error: "config is missing folders option",
      })
      .array(),
    ignore: z
      .string({
        required_error: "config is missing ignore option",
      })
      .array(),
  });
  const parsedConfig = configSchema.safeParse(config);
  if (!parsedConfig.success) {
    console.log(
      `${parsedOptions.data.config}: Invalid config: ${parsedConfig.error.errors[0].message}`,
    );
    process.exit(2);
  }

  const files = fs.readdirSync(repoPath, {
    recursive: true,
    encoding: "utf8",
  });

  const result = gitslice({
    mode: parsedOptions.data.mode,
    pathsToIgnore: parsedConfig.data.ignore,
    pathsToSlice: parsedConfig.data.folders,
    upstreamRepoFiles: files,
  });
  result.filesToSlice.forEach((file) => console.log(file));
  process.exit(0);
};

main();
