Just testing the Github API
# GitSlice

This repo provides two packages

- [@gitstart/gitslice-ignore](./packages/ignore/) - The reference implementation of the slicing algorithm that controls what should be sliced and what should not be.
- [gitslice](./packages/cli/) - A CLI that can be used to test the above library locally. In the future it can also be used to run gitslice push and pull operations.

## Contributing

If you have suggestions or bug reports to submit, [open an issue](https://github.com/Murcul/gitslice/issues/new).

### Getting started

- Fork and clone the repository.
- Use the node version specified in [.nvmrc](./.nvmrc). If you use nvm, you can run:

```bash
$ nvm use
```

- Install dependencies:

```bash
$ npn install
```

- Run the tests in all packages:

```bash
$ npm test
```

- Build all packages:

```bash
$ npm run build
```
