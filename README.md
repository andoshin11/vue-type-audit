# vue-type-audit ![npm](https://img.shields.io/npm/v/vue-type-audit) ![GitHub](https://img.shields.io/github/license/andoshin11/vue-type-audit) ![CI Status](https://github.com/andoshin11/vue-type-audit/workflows/main/badge.svg)

A TypeScript error checker that supports Vue SFC(Single File Component).

<img width="600" alt="Screen Shot 2020-04-13 at 0 10 54" src="https://user-images.githubusercontent.com/8381075/79072323-69276580-7d1b-11ea-9112-f011f642fcde.png">

<img width="600" alt="Screen Shot 2020-04-13 at 0 11 18" src="https://user-images.githubusercontent.com/8381075/79072319-6593de80-7d1b-11ea-92ef-2b2e2c7d10d5.png">

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
