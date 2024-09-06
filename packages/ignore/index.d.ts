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

type GitSliceOutput = {
  /**
   * All the files that should be pulled into the sliced repo
   */
  filesToSlice: string[];
  /**
   * All the files that should not be pulled into the sliced repo
   */
  filesToIgnore: string[];
};

declare function gitslice(input: GitSliceInput): GitSliceOutput;
