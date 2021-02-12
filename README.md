<div align="center">
  <br/>
  <br/>
  <img src="./assets/logo.png" alt="whybundled" width="600" align="center">
  <br/>
  <br/>
  <br/>
  <br/>
  <br/>
</div>

<p align="center">
  <a href="https://npmjs.org/package/whybundled">
    <img src="https://img.shields.io/npm/v/whybundled.svg" alt="NPM Version">
  </a>

  <a href="http://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/npm/l/whybundled.svg" alt="License">
  </a>

  <a href="https://github.com/d4rkr00t/whybundled/issues">
    <img src="https://img.shields.io/github/issues/d4rkr00t/whybundled.svg" alt="Github Issues">
  </a>

  <a href='https://coveralls.io/github/d4rkr00t/whybundled'>
    <img src='https://coveralls.io/repos/github/d4rkr00t/whybundled/badge.svg' alt='Coverage Status' />
  </a>

  <a href="http://commitizen.github.io/cz-cli/">
    <img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen Friendly">
  </a>
</p>
<br/>
<br/>

Ever wondered why any particular module ended up in a bundle? WhyBundled is here to answer exactly this question.

It's meant to be used alongside [stats report from webpack](https://webpack.js.org/api/stats/).

## Quick Start

```sh
npm i -g whybundled

whybundled stats.json ← stats file generated by wepback
```

![whybundled default report](/assets/screenshot.png)

## Usage

```sh
Usage
  $ whybundled stats.json "[pattern]"                   [default command]
  $ whybundled stats.json --ignore babel-runtime,tslib  [default command]
  $ whybundled stats.json --by styled-components        [by command]

Default options:
  [pattern]          Optional pattern used to filter output to only matched modules
                     Note: you might need to wrap the pattern in quotes to use wildcards, e.g. "*.jsx"
  --ignore           Comma separated list of glob pattern to exclude modules from final output
  --modulesOnly      Only include modules
  --filesOnly        Only include files
  --directOnly       Only include direct dependencies
  --transitiveOnly   Only include transitive dependencies
  --duplicatesOnly   Only include modules that have duplicates in a resulting bundle
  --limit            Limits output of reasons and files [default: 20]

By options [--by]:
  --ignore           Comma separated list of glob pattern to exclude modules from final output
  --limit            Limits output of reasons and files [default: 20]
  --only             Limits output to only include modules that were included by specified module exclusively

Other options:
  -v, --version      Shows version.
  --help             Shows help.

Examples
  $ whybundled stats.json --modulesOnly
```

## Features

### Stats Analyses

- Outputs list of all modules/files included in the bundle in from most imported to least imported order.
- Builds a chain of dependencies for transitive dependencies.
- Shows all files that were included for particular module.
- Shows all reasons why particular module was included.

```sh
MODULE  isobject
├─ imported: 1 time     ← number of times module imported
├─ type: [transitive]   ← type of a dependency can be either direct or transitive
│  └─ isobject -> is-plain-object -> styled-components    ← for transitive dependencies whybundled outputs a chain of dependencies up to the closest direct
│
├─ locations:  ← where module is located in a project
│  └─ ../node_modules/isobject/
│
├─ files:      ← list of files that were included for this module
│  └─ ../node_modules/isobject/index.js
│
└─ reasons:    ← list of reasons why module was included in a bundle
   └─ is-plain-object
      └─ ../node_modules/is-plain-object/index.js  10:15-34  [cjs require]
```

### Duplicates Badge

If module has been bundled several times from different locations `whybundled` adds `[multiple]` badge next to the locations field:

![whybundled duplicates](/assets/multiple.png)

### Brought by

Using `--by` flag `whybundled` shows all modules that were brought into the bundle by a particular module:

```sh
whybundled stats.json --by styled-components
```

![whybundled brought by](/assets/by.png)
