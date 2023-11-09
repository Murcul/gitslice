import micromatch from "micromatch";

type GitSliceInput = {
  mode: "ignore" | "slice";
  pathsToSlice: string[];
  pathsToIgnore: string[];
  // All the files that are in the repo, relative to the root folder of the repo.
  files: string[];
};

export type GitSliceOutput = {
  filesToSlice: string[];
};

const matcher = (files: string[], toMatch: string[], toExclude: string[]) => {
  return micromatch(
    files,
    [
      ...toMatch.flatMap((path) => {
        const parsedPath =
          path === "/" ? path : path.startsWith("/") ? path.slice(1) : path;
        if (parsedPath.endsWith("*")) {
          return [parsedPath];
        }
        return [parsedPath, `${parsedPath}/*`];
      }),
      ...toExclude.flatMap((path) => {
        const parsedPath =
          path === "/" ? path : path.startsWith("/") ? path.slice(1) : path;
        if (parsedPath.endsWith("*")) {
          return [`!${parsedPath}`];
        }
        return [`!${parsedPath}`, `!${parsedPath}/*`];
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
        input.files,
        input.pathsToSlice,
        input.pathsToIgnore,
      ),
    };
  }
  const toIgnore = matcher(
    input.files,
    input.pathsToIgnore,
    input.pathsToSlice,
  );
  return {
    filesToSlice: input.files.filter((file) => !toIgnore.includes(file)),
  };
}
