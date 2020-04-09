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

## License

MIT
