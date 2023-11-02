import micromatch from "micromatch";

type GitSliceInput = {
  mode: "ignore" | "slice";
  pathsToSlice: string[];
  pathsToIgnore: string[];
  // All the files that are in the upstream repo, relative to the root folder of the upstream repo.
  upstreamRepoFiles: string[];
};

export type GitSliceOutput = {
  filesToSlice: string[];
};

const matcher = (files: string[], toMatch: string[], toExclude: string[]) => {
  return micromatch(
    files,
    [
      ...toMatch.flatMap((path) => {
        if (path.endsWith("*")) {
          return [path];
        }
        return [path, `${path}/*`];
      }),
      ...toExclude.flatMap((path) => {
        if (path.endsWith("*")) {
          return [`!${path}`];
        }
        return [`!${path}`, `!${path}/*`];
      }),
    ],
    {
      bash: true,
      dot: true,
    },
  );
};

export function gitslice(input: GitSliceInput): GitSliceOutput {
  if (input.mode === "ignore") {
    return {
      filesToSlice: matcher(
        input.upstreamRepoFiles,
        input.pathsToSlice,
        input.pathsToIgnore,
      ),
    };
  }
  const toIgnore = matcher(
    input.upstreamRepoFiles,
    input.pathsToIgnore,
    input.pathsToSlice,
  );
  return {
    filesToSlice: input.upstreamRepoFiles.filter(
      (file) => !toIgnore.includes(file),
    ),
  };
}
