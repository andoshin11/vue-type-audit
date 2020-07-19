# vue-type-audit ![npm](https://img.shields.io/npm/v/vue-type-audit) ![GitHub](https://img.shields.io/github/license/andoshin11/vue-type-audit) ![CI Status](https://github.com/andoshin11/vue-type-audit/workflows/main/badge.svg)

A TypeScript error checker that supports Vue SFC(Single File Component).
The world's only tool that runs type checking for both child components' prop types and event handler types on Vue template.

<img width="600" alt="Audit Result" src="https://user-images.githubusercontent.com/8381075/87878974-ba35ac80-ca22-11ea-9f3d-e013c07ac156.png">

<br/>

<img width="600" alt="App.vue" src="https://user-images.githubusercontent.com/8381075/87878993-d0436d00-ca22-11ea-98d7-fc3c120a27d1.png">

<br/>

<img width="600" alt="Counter.vue" src="https://user-images.githubusercontent.com/8381075/87879011-e18c7980-ca22-11ea-931e-6fe1b94556f5.png">

<br/>

<img width="600" alt="HelloWorld.vue" src="https://user-images.githubusercontent.com/8381075/87879015-ebae7800-ca22-11ea-96eb-166459dbb2fb.png">


## Current Limitation

- only tested with [vue@3.0.0-rc.1](https://www.npmjs.com/package/vue/v/3.0.0-rc.1).
- only tested with standard Vue SFC. (Class-Style component is not tested!)

## Example Usage

See [example](./example)

## Install

```sh
$ yarn add vue-type-audit
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
