# vue-type-audit

A TypeScript error checker that supports Vue SFC(Single File Component).

<img width="600" alt="Screen Shot 2020-04-10 at 3 57 07" src="https://user-images.githubusercontent.com/8381075/78930656-70fac600-7adf-11ea-8ed1-2fb0a9bf78d9.png">

<img width="600" alt="Screen Shot 2020-04-10 at 3 55 01" src="https://user-images.githubusercontent.com/8381075/78930500-32fda200-7adf-11ea-8873-2b4431512c0b.png">


## Current Limitation

- supports [vue-next](https://github.com/vuejs/vue-next) only
- all components **must** have `<script/>` block
- only tested with standard Vue SFC. (Class-Style component is not tested!)

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

When some `.ts/.tsx` module tries to import `.vue` files, this tool intercepts module resolving process of the compiler and returns transformed `.vue` file. (internally the file is interpreted as `<your component name>.vue.ts`)

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
         parsed into blocks ┌----> `a.vue.script.ts` ------------┐
                            |                                    |
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
