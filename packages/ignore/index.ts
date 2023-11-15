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
    `${prefix}${pathWithoutStartingSlash}*`,
  ];
};

const matcher = (
  files: string[],
  toMatch: string[],
  toExclude: string[],
  not: boolean,
) => {
  const parsedToMatch = toMatch.flatMap((path) => parsePath(path, true));
  const parsedToExclude = toExclude.flatMap((path) => parsePath(path, false));
  const defaultOpts: micromatch.Options = {
    bash: true,
    dot: true,
  };
  if (not) {
    return micromatch.not(
      files,
      [...parsedToMatch, ...parsedToExclude],
      defaultOpts,
    );
  } else {
    return micromatch(
      files,
      [...parsedToMatch, ...parsedToExclude],
      defaultOpts,
    );
  }
};

export function gitslice(input: GitSliceInput): GitSliceOutput {
  input.files = input.files.filter((file) => !file.startsWith(".git/"));
  if (input.mode === "ignore") {
    return {
      filesToSlice: matcher(
        input.files,
        input.pathsToSlice,
        input.pathsToIgnore,
        false,
      ),
      filesToIgnore: matcher(
        input.files,
        input.pathsToSlice,
        input.pathsToIgnore,
        true,
      ),
    };
  }
  const toIgnore = matcher(
    input.files,
    input.pathsToIgnore,
    input.pathsToSlice,
    false,
  );
  return {
    filesToSlice: input.files.filter((file) => !toIgnore.includes(file)),
    filesToIgnore: toIgnore,
  };
}
