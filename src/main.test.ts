import { expect, describe, it } from "vitest";
import { GitSliceOutput, gitslice } from "./main";

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
describe("gitslice", () => {
  it("in ignore mode, ignores everything if no pathsToSlice", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: [],
        pathsToSlice: [],
        upstreamRepoFiles: files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [],
    });
  });

  it("in ignore mode, only slices the given file pathToSlice", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: [],
        pathsToSlice: ["package-lock.json", ".gitignore"],
        upstreamRepoFiles: files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["package-lock.json", ".gitignore"],
    });
  });

  it("in ignore mode, only slices the given folder pathToSlice and its contents", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: ["src2/sub1", "src2/sub2/*"],
        pathsToSlice: ["src/*", "src2"], // slice everything in both the src and src2 folders
        upstreamRepoFiles: files,
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

  it("in ignore mode, ignores specific subfiles set in pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: ["src/main.ts"],
        pathsToSlice: ["src/*"],
        upstreamRepoFiles: files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [
        "src/main.test.ts",
        "src/vite-env.d.ts",
        "src/utils/help.ts",
      ],
    });
  });

  it("in slice mode, slices everything if no pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: [],
        pathsToSlice: [],
        upstreamRepoFiles: files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: files,
    });
  });

  it("in slice mode, ignores the given file in pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: [".gitignore", "package.json"],
        pathsToSlice: [],
        upstreamRepoFiles: files,
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

  it("in slice mode, ignores the given folder and its contents in pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["src/*", "src2"],
        pathsToSlice: ["src2/sub1", "src2/sub2/*"],
        upstreamRepoFiles: files,
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

  it("in slice mode, ignores the given folder and its contents in pathsToIgnore, but keep an explicit subfile if asked for", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["src/*", "src2"],
        pathsToSlice: ["src/main.ts"],
        upstreamRepoFiles: files,
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
});
