import { expect, describe, it } from "vitest";
import { GitSliceOutput, gitslice } from "./index";

const files = [
  "package-lock.json",
  "src/main.test.ts",
  "src/vite-env.d.ts",
  "src/main.ts",
  "src/utils/help.ts",
  "src2/main.ts",
  "src2/sub/main.ts",
  "src2/sub1/a.ts",
  "src2/sub2/a.ts",
  ".gitignore",
  "package.json",
  "test.exs",
  "tsconfig.json",
];

describe("ignore mode", () => {
  it("ignores everything if no pathsToSlice", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: [],
        pathsToSlice: [],
        files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [],
    });
  });

  it("only slices the given file pathToSlice", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: [],
        pathsToSlice: ["package-lock.json", ".gitignore"],
        files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["package-lock.json", ".gitignore"],
    });
  });

  it("only slices the given folder pathToSlice and its contents", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: ["src2/sub1", "src2/sub2/*"],
        pathsToSlice: ["src/*", "src2"], // slice everything in both the src and src2 folders
        files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [
        "src/main.test.ts",
        "src/vite-env.d.ts",
        "src/main.ts",
        "src/utils/help.ts",
        "src2/main.ts",
        "src2/sub/main.ts",
      ],
    });
  });

  it("ignores specific subfiles set in pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: ["src/main.ts"],
        pathsToSlice: ["src/*"],
        files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [
        "src/main.test.ts",
        "src/vite-env.d.ts",
        "src/utils/help.ts",
      ],
    });
  });

  it("can ignore files in multiple subfolders using ** wildcards", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: ["src/**/ignored.ts"],
        pathsToSlice: ["src"],
        files: [
          "src/1.ts",
          "src/a/1.ts",
          "src/ignored.ts",
          "src/a/to_slice.ts",
          "src/b/c/to_slice.ts",
          "src/b/c/ignored.ts",
          "src/b/ignored.ts",
          "src/a/b/ignored.ts",
          "ignored.ts",
        ],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [
        "src/1.ts",
        "src/a/1.ts",
        "src/a/to_slice.ts",
        "src/b/c/to_slice.ts",
      ],
    });
  });

  it("ignores . files in folders in pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: ["src/secrets"],
        pathsToSlice: ["src"],
        files: [
          "secret",
          "src/slice",
          "src/slice/slice",
          "src/.slice",
          "src/secrets/ignored",
        ],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["src/slice", "src/slice/slice", "src/.slice"],
    });
  });

  it("can slice everything using *", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: [],
        pathsToSlice: ["*"],
        files: ["a", "a/b"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["a", "a/b"],
    });
  });

  it("can slice everything using /*", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: [],
        pathsToSlice: ["/*"],
        files: ["a", "a/b"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["a", "a/b"],
    });
  });

  it("can slice everything using * except for pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: ["c", "d/e"],
        pathsToSlice: ["*"],
        files: ["a", "a/b", "c", "d/e"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["a", "a/b"],
    });
  });

  it("can slice everything using /* except for pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: ["c", "d/e"],
        pathsToSlice: ["/*"],
        files: ["a", "a/b", "c", "d/e"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["a", "a/b"],
    });
  });

  it("can slice paths starting with /", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: [],
        pathsToSlice: ["/a"],
        files: ["a", "a/b", "c", "d/e"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["a", "a/b"],
    });
  });

  it("can slice and ignore paths starting with /", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: ["/a/b"],
        pathsToSlice: ["/a"],
        files: ["a", "a/b", "c", "d/e"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["a"],
    });
  });

  it("a single '/' path has no effect", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: [],
        pathsToSlice: ["/"],
        files: ["a", "a/b", "c", "d/e"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [],
    });
  });
});
describe("slice mode", () => {
  it("slices everything if no pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: [],
        pathsToSlice: [],
        files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: files,
    });
  });

  it("ignores the given file in pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: [".gitignore", "package.json"],
        pathsToSlice: [],
        files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [
        "package-lock.json",
        "src/main.test.ts",
        "src/vite-env.d.ts",
        "src/main.ts",
        "src/utils/help.ts",
        "src2/main.ts",
        "src2/sub/main.ts",
        "src2/sub1/a.ts",
        "src2/sub2/a.ts",
        "test.exs",
        "tsconfig.json",
      ],
    });
  });

  it("ignores the given folder and its contents in pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["src/*", "src2"],
        pathsToSlice: ["src2/sub1", "src2/sub2/*"],
        files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [
        "package-lock.json",
        "src2/sub1/a.ts",
        "src2/sub2/a.ts",
        ".gitignore",
        "package.json",
        "test.exs",
        "tsconfig.json",
      ],
    });
  });

  it("ignores the given folder and its contents in pathsToIgnore, but keep an explicit subfile if asked for", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["src/*", "src2"],
        pathsToSlice: ["src/main.ts"],
        files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [
        "package-lock.json",
        "src/main.ts",
        ".gitignore",
        "package.json",
        "test.exs",
        "tsconfig.json",
      ],
    });
  });

  it("can slice files in multiple subfolders using ** wildcards", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["src"],
        pathsToSlice: ["src/**/to_slice.ts"],
        files: [
          "src/1.ts",
          "src/to_slice.ts",
          "src/a/1.ts",
          "src/a/to_slice.ts",
          "src/b/c/to_slice.ts",
          "src/b/c/ignored.ts",
          "src/b/ignored.ts",
          "src/a/b/ignored.ts",
          "sliced.ts",
        ],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [
        "src/to_slice.ts",
        "src/a/to_slice.ts",
        "src/b/c/to_slice.ts",
        "sliced.ts",
      ],
    });
  });

  it("slices . files inside folders in pathsToSlice", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["secrets"],
        pathsToSlice: ["secrets/public"],
        files: [
          "slice",
          "public",
          ".public",
          "secrets/secret1.txt",
          "secrets/public/known.txt",
          "secrets/public/.known.txt",
        ],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [
        "slice",
        "public",
        ".public",
        "secrets/public/known.txt",
        "secrets/public/.known.txt",
      ],
    });
  });

  it("can ignore everything using *", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["*"],
        pathsToSlice: [],
        files: ["a", "a/b"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [],
    });
  });

  it("can ignore everything using *", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["/*"],
        pathsToSlice: [],
        files: ["a", "a/b"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [],
    });
  });

  it("can ignore everything using * except for pathsToSlice", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["*"],
        pathsToSlice: ["c", "d/e"],
        files: ["a", "a/b", "c", "d/e"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["c", "d/e"],
    });
  });

  it("can ignore everything using /* except for pathsToSlice", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["/*"],
        pathsToSlice: ["/c", "d/e"],
        files: ["a", "a/b", "c", "d/e"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["c", "d/e"],
    });
  });

  it("can ignore paths starting with /", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["/a"],
        pathsToSlice: [],
        files: ["a", "a/b", "c", "d/e"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["c", "d/e"],
    });
  });

  it("can ignore and slice paths starting with /", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["/a"],
        pathsToSlice: ["/a/b"],
        files: ["a", "a/b", "c", "d/e"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["a/b", "c", "d/e"],
    });
  });

  it("a single '/' path has no effect", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["/"],
        pathsToSlice: [],
        files: ["a", "a/b", "c", "d/e"],
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["a", "a/b", "c", "d/e"],
    });
  });
});
