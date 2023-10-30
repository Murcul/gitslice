import { expect, describe, it } from "vitest";
import { GitSliceOutput, gitslice } from "./main";

const files = [
  "package-lock.json",
  "src/main.test.ts",
  "src/vite-env.d.ts",
  "src/main.ts",
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
        pathsToSlice: ["package-lock.json"],
        upstreamRepoFiles: files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["package-lock.json"],
    });
  });

  it("in ignore mode, only slices the given folder pathToSlice and its contents", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: [],
        pathsToSlice: ["src"],
        upstreamRepoFiles: files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["src/main.test.ts", "src/vite-env.d.ts", "src/main.ts"],
    });
  });

  it("in ignore mode, ignores specific subfiles set in pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "ignore",
        pathsToIgnore: ["src/main.ts"],
        pathsToSlice: ["src"],
        upstreamRepoFiles: files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: ["src/main.test.ts", "src/vite-env.d.ts"],
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
        pathsToIgnore: [".gitignore"],
        pathsToSlice: [],
        upstreamRepoFiles: files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [
        "package-lock.json",
        "src/main.test.ts",
        "src/vite-env.d.ts",
        "src/main.ts",
        "package.json",
        "test.exs",
        "tsconfig.json",
      ],
    });
  });

  it("in slice mode, ignores the given folder and its contents in pathsToIgnore", () => {
    expect(
      gitslice({
        mode: "slice",
        pathsToIgnore: ["src"],
        pathsToSlice: [],
        upstreamRepoFiles: files,
      }),
    ).toEqual<GitSliceOutput>({
      filesToSlice: [
        "package-lock.json",
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
        pathsToIgnore: ["src"],
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
