import micromatch from "micromatch";

type GitSliceInput = {
  /**
   * Use "ignore" when you want to ignore everything by default.
   * Use "slice" when you want to slice everything by default
   */
  mode: "ignore" | "slice";
  /**
   * The paths that you want to ensure are sliced
   * Empty strings are ignored
   */
  pathsToSlice: string[];
  /**
   * The paths that you want to ensure are ignored
   * Empty strings are ignored
   */
  pathsToIgnore: string[];
  /**
   * All the files in the repo, relative to the root folder of the repo
   */
  files: ReadonlyArray<string>;
};

export type GitSliceOutput = {
  /**
   * All the files that should be pulled into the sliced repo
   */
  filesToSlice: string[];
  /**
   * All the files that should not be pulled into the sliced repo
   */
  filesToIgnore: string[];
};

const parsePath = (path: string, match: boolean) => {
  const prefix = match ? "" : "!";
  if (path === "/") {
    return [`${prefix}${path}`];
  }
  const pathWithoutStartingSlash = path.startsWith("/") ? path.slice(1) : path;
  if (pathWithoutStartingSlash.endsWith("*")) {
    return [`${prefix}${pathWithoutStartingSlash}`];
  }
  if (pathWithoutStartingSlash.endsWith("/")) {
    return [`${prefix}${pathWithoutStartingSlash}*`];
  }
  return [
    `${prefix}${pathWithoutStartingSlash}`,
    `${prefix}${pathWithoutStartingSlash}/*`,
  ];
};

const matcher = (files: string[], toMatch: string[], toExclude: string[]) => {
  const parsedToMatch = toMatch.flatMap((path) => parsePath(path, true));
  const parsedToExclude = toExclude.flatMap((path) => parsePath(path, false));
  const defaultOpts: micromatch.Options = {
    bash: true,
    dot: true,
  };

  return micromatch(files, [...parsedToMatch, ...parsedToExclude], defaultOpts);
};

export function gitslice(input: GitSliceInput): GitSliceOutput {
  const parsedInput = {
    files: input.files.filter((file) => !file.startsWith(".git/")),
    mode: input.mode,
    pathsToIgnore: input.pathsToIgnore.filter((path) => path.length > 0),
    pathsToSlice: input.pathsToSlice.filter((path) => path.length > 0),
  };
  if (parsedInput.mode === "ignore") {
    const toSlice = matcher(
      parsedInput.files,
      parsedInput.pathsToSlice,
      parsedInput.pathsToIgnore,
    );
    return {
      filesToSlice: toSlice,
      filesToIgnore: parsedInput.files.filter(
        (file) => !toSlice.includes(file),
      ),
    };
  }
  const toIgnore = matcher(
    parsedInput.files,
    parsedInput.pathsToIgnore,
    parsedInput.pathsToSlice,
  );
  return {
    filesToSlice: parsedInput.files.filter((file) => !toIgnore.includes(file)),
    filesToIgnore: toIgnore,
  };
}
