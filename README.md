# vue-type-audit ![npm](https://img.shields.io/npm/v/vue-type-audit) ![GitHub](https://img.shields.io/github/license/andoshin11/vue-type-audit) ![CI Status](https://github.com/andoshin11/vue-type-audit/workflows/main/badge.svg)

A TypeScript error checker that supports Vue SFC(Single File Component).

<img width="600" alt="Screen Shot 2020-04-10 at 14 56 25" src="https://user-images.githubusercontent.com/8381075/78966757-9f0df380-7b3b-11ea-88bd-6ff413eea264.png">

<img width="600" alt="Screen Shot 2020-04-10 at 14 56 06" src="https://user-images.githubusercontent.com/8381075/78966740-974e4f00-7b3b-11ea-82fe-018123a6c13c.png">

## Current Limitation

- supports [vue-next](https://github.com/vuejs/vue-next) only
- only tested with standard Vue SFC. (Class-Style component is not tested!)

## Example Usage

See [example](./example)

## Install

```sh
$ yarn install vue-type-audit
```

## How to use

```sh
$ cd <your project root>
$ node_modules/.bin/type-audit run
```

## CLI Options

```sh
Options:
  -V, --version              output the version number
  -h, --help                 output usage information
```

## Architecture

This tool uses [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) to run diagnostics.

When some `.ts/.tsx` module tries to import `.vue` files, this tool intercepts module resolving process of the compiler and returns transformed `.vue` files. (internally the file is interpreted in `<your component name>.vue.ts` format)

```
          import a.vue                     reads actual file
                          ┌-------------┐
`A.ts` -----------------> | TS Compiler | <----------------->  `a.vue`
       <----------------- └-------------┘
                                    ↑
       returns a.vue.ts             |  transforms a.vue   ┌-------------┐
      (transformed version)         └-------------------->| Transformer |
                                        returns a.vue.ts  └-------------┘
```

Transforming process itself is very complicated.
The entire process can be broke down into 4 steps.

1. Parse blocks from SFC.
2. Tranform the template into a render function
3. Modify codes to help type-checking process easier
3. Merge into one `.vue.ts` file

```
                            `a.vue.script.compiled.ts` ----------┐
                                        ↑                        |
          extra transformation          |                        |
                                        |                        |
                            ┌--> `a.vue.script.ts`               |
        parsed into blocks  |                                    |
                            |                                    | merged
`a.vue` --------------------|                                    |
                            |                                    ↓
                            └--> `a.vue.template.ts`        `a.vue.ts`
                                        |                        ↑
     compiled to a render function      |                        |
                                        ↓                        |
                            `a.vue.template.compiled.ts`         | merged
                                        |                        |
        extra transformation            |                        |
                                        ↓                        | 
                      `a.vue.template.compiled.transformed.ts` - ┘

```

Each transformation process emits sourcemap object, so that the error reporter can locate the original position of the code.

## License

MIT
