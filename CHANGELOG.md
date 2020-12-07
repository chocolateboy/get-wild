## 1.3.0 - 2020-12-07

### Features

- add curried (data last) versions of `get` and `getter` via `get-wild/fp`
- add `exports.parse` as an alias for `exports.parser`

### Fixes

- fix a bug which caused custom `collect`, `map` and `flatMap` settings to be
  forgotten after the first wildcard match

### Changes

- types: narrow `get`'s return type from `any` to `unknown`

## 1.2.0 - 2020-09-19

- add `exports.split` as an alias for `exports.parser`
- add `options.split` as an alias for `options.parser`

## 1.1.0 - 2020-09-19

- allow `parser` to accept a string as a shortcut for `path => path.split(string)`

## 1.0.1 - 2020-09-18

- remove superfluous file from the package

## 1.0.0 - 2020-09-18

- allow the path to be a single number or symbol

## 0.3.1 - 2020-09-18

- type tweaks

## 0.3.0 - 2020-09-18

- type fixes

## 0.2.0 - 2020-09-17

- add a `collect` option to customize value extraction

## 0.1.1 - 2020-09-17

- speed up wildcard matching

## 0.1.0 - 2020-09-17

- add a `default` option to bake in the default value
- speed up array globbing

## 0.0.3 - 2020-09-17

- documentation fix

## 0.0.2 - 2020-09-17

- parser:
    - add missing backslash (\\) to the list of excluded name characters
    - portability fix: replace lookbehind assertion (not supported on Safari)
      with lookahead

## 0.0.1 - 2020-09-15

- initial release
