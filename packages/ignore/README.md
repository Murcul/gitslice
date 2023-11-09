# GitSlice Ignore

This library provides the reference/core implementation of the slicing algorithm used by GitSlice. All gitslice providers should reuse this library when handling gitslice push/pull operations.

## Quick start

### Install
```bash
$ npm install @gitstart/gitslice-ignore
```

### Usage

Input your config and get the files to slice:
```typescript
import { gitslice } from "@gitstart/gitslice-ignore"

const output = gitslice({
  mode: "ignore",
  pathsToIgnore: [],
  pathsToSlice: ["allow_slicing"],
  files: // list of files in the repo
})

// Output all the files that should be sliced from the repo.
console.log(output.filesToSlice)
```

Note that you can call this library on either the sliced repo or the upstream repo, as the same gitslice config should work for both. You may need to do both repos for specific steps of the gitslice push/pull operations.