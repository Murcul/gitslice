import micromatch from "micromatch";

type GitSliceInput = {
  mode: "ignore" | "slice";
  pathsToSlice: string[];
  pathsToIgnore: string[];

  // Only one of the below 2 need to be known
  // This is the local directory in which the upstream repo has been cloned.
  // Our library will then recursively read this directory to figure out what `upstreamRepoFiles` should be.
  // upstreamRepoDirectory: string[];

  // All the files that are in the upstream repo, relative to the root folder of the upstream repo.
  upstreamRepoFiles: string[];
};

export type GitSliceOutput = {
  filesToSlice: string[];
};
// type Rule = {
//   mode: "ignore" | "slice";
//   path: string;
// };

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

// export function gitslice2(input: GitSliceInput): GitSliceOutput {
//   const filesToSlice: string[] = [];

//   input.upstreamRepoFiles.forEach((file) => {
//     let rule: Rule | null = null;
//     input.pathsToIgnore.forEach((ignorePath) => {
//       rule = handleFileAndRule(
//         file,
//         {
//           mode: "ignore",
//           path: ignorePath,
//         },
//         null,
//       );
//     });
//     input.pathsToSlice.forEach((slicePath) => {
//       rule = handleFileAndRule(
//         file,
//         {
//           mode: "slice",
//           path: slicePath,
//         },
//         rule,
//       );
//     });
//     if (!rule) {
//       if (input.mode === "slice") {
//         filesToSlice.push(file);
//       }
//       return;
//     }

//     const selectedRule: Rule = rule;
//     if (selectedRule.mode === "ignore") {
//       return;
//     }
//     if (selectedRule.mode === "slice") {
//       filesToSlice.push(file);
//       return;
//     }
//   });

//   return {
//     filesToSlice,
//   };
// }

// const handleFileAndRule = (
//   file: string,
//   rule: Rule,
//   currentRule: Rule | null,
// ) => {
//   if (!file.startsWith(rule.path)) {
//     return currentRule;
//   }
//   if (currentRule && currentRule.path.length > rule.path.length) {
//     return currentRule;
//   }
//   return rule;
// };
