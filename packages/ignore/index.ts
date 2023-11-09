import micromatch from "micromatch";

type GitSliceInput = {
  /**
   * Use "ignore" when you want to ignore everything by default.
   * Use "slice" when you want to slice everything by default
   */
  mode: "ignore" | "slice";
  /**
   * The paths that you want to ensure are sliced
   */
  pathsToSlice: string[];
  /**
   * The paths that you want to ensure are ignored
   */
  pathsToIgnore: string[];
  /**
   * All the files in the repo, relative to the root folder of the repo
   */
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
