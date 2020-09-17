# get-wild

[![Build Status](https://travis-ci.org/chocolateboy/get-wild.svg)](https://travis-ci.org/chocolateboy/get-wild)
[![NPM Version](https://img.shields.io/npm/v/get-wild.svg)](https://www.npmjs.org/package/get-wild)

<!-- toc -->

- [NAME](#name)
- [FEATURES](#features)
- [INSTALLATION](#installation)
- [SYNOPSIS](#synopsis)
    - [Negative array indices](#negative-array-indices)
    - [Wildcards](#wildcards)
- [DESCRIPTION](#description)
  - [Why?](#why)
  - [Why not?](#why-not)
- [TYPES](#types)
- [EXPORTS](#exports)
  - [get](#get)
  - [getter](#getter)
  - [parser](#parser)
- [OPTIONS](#options)
  - [default](#default)
  - [flatMap](#flatmap)
  - [map](#map)
  - [parser](#parser-1)
- [DEVELOPMENT](#development)
- [COMPATIBILITY](#compatibility)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- tocstop -->

# NAME

get-wild - pluck nested properties from an object with support for wildcards

# FEATURES

- configurable wildcard support, e.g. `"foo.*.bar"`
- support for negative array indices, e.g. `"foo[-1].bar"`
- pluggable path parser
- no dependencies
- &lt; 700 B minified + gzipped
- fully typed (TypeScript)
- CDN builds (UMD) - [jsDelivr][], [unpkg][]

# INSTALLATION

```
$ npm install get-wild
```

# SYNOPSIS

```javascript
import { get } from 'get-wild'

const obj = { foo: { bar: { baz: 'quux' } } }

get(obj, 'foo.bar.baz')               // "quux"
get(obj, 'foo.fizz.buzz')             // undefined
get(obj, 'foo.fizz.buzz', 42)         // 42
get(obj, ['foo', 'bar', 'baz'])       // "quux"
get(obj, ['foo', 'fizz', 'buzz'], 42) // 42
```

### Negative array indices

```javascript
const array = [
    [{ value: 1 }, { value: 2 }, { value: 3 }],
    [{ value: 4 }, { value: 5 }, { value: 6 }],
    [{ value: 7 }, { value: 8 }, { value: 9 }],
]

get(array, '[1][-2].value')   // 5
get(array, [-1, -1, 'value']) // 9
```

### Wildcards

```javascript
const data = {
    users: {
        'abc123': {
            name: 'John Doe',
            homepage: 'https://example.com/john-doe',
            hobbies: ['eating', 'sleeping'],
        },
        'def345': {
            name: 'Jane Doe',
            homepage: 'https://example.com/jane-doe',
        },
        'ghi567': {
            name: 'Nemo',
            hobbies: ['singing', 'dancing'],
        }
    }
}

get(data, 'users.*.name')
// ["John Doe", "Jane Doe", "Nemo"]

get(data, 'users.*.homepage')
// ["https://example.com/john-doe", "https://example.com/jane-doe", undefined]

// also works with arrays
get(array, '1.*.value')    // [4, 5, 6]
get(array, '[-1].*.value') // [7, 8, 9]

```

#### Flatten results

```javascript
get(data, 'users.*.hobbies')
// ["eating", "sleeping", undefined, "singing", "dancing"]
```

#### Remove missing results

```javascript
get(data, 'users.*.hobbies', [])
// ["eating", "sleeping", "singing", "dancing"]
```

#### Raw results

```javascript
get(data, 'users.**.hobbies')
// [["eating", "sleeping"], undefined, ["singing", "dancing"]]
```

# DESCRIPTION

This module exports a function which can be used to pluck nested properties
from an object, including arrays and any other non-falsey values. This is
similar to the `get` function provided by Lodash (and many other libraries),
but it adds the following features:

  - wildcard support, e.g. `"foo.*.bar.*.baz"`
  - support for negative array indices, e.g. `"foo[-1][-2]"`

In addition to the default `get` implementation, get-wild exports a builder
function ([`getter`](#getter)) which can be used to create a custom `get` with
different [options](#options) baked in.

## Why?

I needed a small, dependency-free version of `Lodash#get` with wildcard
support, and preferably with an option to filter out/exclude missing values.
Although there are a huge number of `get` implementations on NPM, I could only
find one or two with wildcard support and none that are
standalone/dependency-free.

## Why not?

If you don't need support for wildcards, negative array-indices, or other
[options](#options), there are smaller implementations, e.g.
[just-safe-get](https://www.npmjs.com/package/just-safe-get).

# TYPES

The following types are referenced in the descriptions below.

```typescript
type Options = {
    default?: any;
    flatMap?: PropertyKey | false;
    map?: PropertyKey | false;
    parse?: (path: string) => Array<PropertyKey>;
};

type Path = string | Array<PropertyKey>;
```

# EXPORTS

## get

- **Type**:
    - `<D, O, T extends unknown>(obj: O, path: Path, $default: D) ⇒ D | O | T | Array<D | T>`
    - `<O, T extends unknown>(obj: O, path: Path) ⇒ O | T | undefined | Array<T | undefined>`

```javascript
import { get } from 'get-wild'

get(obj, 'foo.*.bar', [])
```

`get` takes an object, a path and an optional default value, and returns the
value(s) found in the object at the specified path, or the default value (which
is undefined by default) if the path doesn't exist or the value is undefined.
The path can be supplied as a dotted expression (string) or an array of steps
(strings, symbols or numbers).

The [syntax](#path-syntax) for dotted path expressions mostly matches that of
regular JavaScript path expressions, with a few additions.

If there are no steps in the path, the object itself is returned (or the
default value if the object is undefined).

Wildcard matching is performed by extracting an array of values at the
wildcard's location and recursively [`get`](#get)ting the remainder of the path
from each value. Wildcards can be used at any locations in a path to turn a
single lookup into an array of lookup results for values at that location.

The values returned by wildcard matches can be customized. By default, `*`
flattens the results (using [`flatMap`][flatMap]), while `**` uses
[`map`][map], which returns the results verbatim, though this mapping can be
configured (or disabled) via the [`map`](#map) and [`flatMap`](#flatmap)
options.

The `get` export is generated by a builder function, [`getter`](#getter), which
can be used to create a custom `get` function with different options.

## getter

- **Type**: `(options?: Options) ⇒ typeof get`

```javascript
import { getter } from 'get-wild'

const parser = path => path.split('.')
const get = getter({ parser })
const obj = { '': { '': 42 } }

get(obj, '.') // 42
```

`getter` is a function which is used to build `get` functions. The default
`get` export is generated by calling `getter` with no arguments, which uses the
following default [options](#options):

```javascript
    {
        default: undefined,
        flatMap: '*',
        map: '**',
        parser: defaultParser,
    }
```

The behavior of `get` can be configured by generating a custom version which
overrides these defaults, e.g.:

```javascript
import { getter } from 'get-wild'

const parser = path => path.split('/')
const get = getter({ parser })

get(obj, 'foo/bar/*/quux')
```

## parser

- **Type**: `(path: string) ⇒ Array<PropertyKey>`

```javascript
import { getter, parser } from 'get-wild'
import memoize from '@example/memoizer'

const memoized = memoize(parser)
const get = getter({ parser: memoized })

get(obj, '...')
```

The default parser used by [`get`](#get) to turn a path expression into an
array of steps (strings, symbols and numbers).

The array of steps used inside the `get` function is not mutated, so, e.g., the
parser can be memoized (or steps can be pre-parsed) to avoid re-parsing
long/frequently-used paths.

### Syntax <a name="path-syntax"></a>

The parser supports an extended version of JavaScript's native path syntax,
e.g. the path:

```javascript
a[-1].b[42]["c.d"].e['f g'].*.h["i \\"j\\" k"][""]
```

is parsed into the following steps:

```javascript
["a", -1, "b", 42, "c.d", "e", "f g", "*", "h", 'i "j" k', ""]
```

Property names are either unquoted (strings), bracketed integers, or bracketed
single or double-quoted strings. Unquoted names can contain any characters
apart from spaces (`\s`), `"`, `'`, <code>&#96;</code>, `[`, `]`, `.` and `\`.

Unquoted property names must be preceded by a dot unless the name is at the
start of the path, in which case the dot must be omitted. Bracketed values
must not be preceded by a dot.

If the path is an empty string, an empty array is returned.

# OPTIONS

## default

- **Type**: `any`
- **Default**: `undefined`

```javascript
const get = getter({ default: [] })

get(data, 'users.*.hobbies')
// ["eating", "sleeping", "singing", "dancing"]

get(data, 'users.*.hobbies', [])
// ["eating", "sleeping", "singing", "dancing"]

get(data, 'users.*.hobbies', undefined)
// ["eating", "sleeping", undefined, "singing", "dancing"]

```

This option allows the default value to be baked into a `get` function. If no
third argument is passed to the function, this value is returned for
missing/undefined properties. Otherwise, the supplied value is returned.

## flatMap

- **Type**: `PropertyKey | false`
- **Default**: `"*"`

```javascript
import { getter } from 'get-wild'

const get = getter({ flatMap: '**', map: '*' })

get(obj, 'foo.**.bar.baz')
```

The token used to map values at the specified location and flatten the results.

If an empty array is supplied as the third argument to [`get`](#get),
missing/undefined values are removed from the result.

If set to false, wildcard matching with `flatMap` is disabled and the token is
treated as a regular property name.

### Usage

Wildcard matching with `flatMap` behaves in a similar way to basic
directory/filename matching with [globs][] (minus the pattern matching). The
selected properties (at the end of the path) are returned as direct children of
the resulting array (wildcard matches always return an array), either as
matched results or as default values if there's no match.

For example, with the default mapping, a path such as
`accounts.active.*.followers.*.name`, which extracts the names of all followers
of active accounts, would return an array of account names interspersed with
default values where an account doesn't have any followers (or if an account's
name is undefined), e.g.:

```javascript
get(data, 'accounts.active.*.followers.*.name')
// ["john", "paul", undefined, "george", undefined, "ringo"]
```

This can be reduced to just the names by setting the default value to an empty
array, e.g.:

```javascript
get(data, 'accounts.active.*.followers.*.name', [])
// ["john", "paul", "george", "ringo"]
```

### Syntax

Note that with the [default parser](#parser), the token must be a
[syntactically-valid](#path-syntax) name, e.g. this doesn't work:

```javascript
import { getter } from 'get-wild'

const get = getter({ flatMap: '[]' })
const obj = { foo: [{ bar: 1 }, { bar: 2 }] }

get(obj, 'foo.[].bar') // SyntaxError: Invalid step @ 3: "foo.[].bar"
```

If a custom parser is supplied, any token can be used:

```javascript
const parser = path => path.split('.')
const get = getter({ flatMap: '[]', parser })

get(obj, 'foo.[].bar') // [1, 2]
```

## map

- **Type**: `PropertyKey | false`
- **Default**: `"**"`

```javascript
import { getter } from 'get-wild'

const get = getter({ map: '*', flatMap: '**' })

get(obj, 'foo.*.bar.baz')
```

The token used to map values at the specified location without flattening the
results.

Unlike [`flatMap`](#flatmap), wildcard matching with `map` preserves all
results, so the default value (which is `undefined` by default) is returned for
missing/undefined properties.

If set to false, wildcard matching with `map` is disabled and the token is
treated as a regular property name.

### Usage

Matching with `map` selects the same values as `flatMap`, but they remain
nested inside arrays, with each enclosing `map` in the path adding another
layer of wrapping.

For this reason, `map` is most useful when there's only one in a path (or for
exploring/debugging) as the selected values tend to be obscured by the array
wrappers returned by enclosing wildcards.

## parser

- **Type**: `(path: string) ⇒ Array<PropertyKey>`

```javascript
import { getter } from  'get-wild'

const parser = path => path.split('.')
const get = getter({ parser })
const obj = { '': { '': 42 } }

get(obj, '.') // 42
```

A function which takes a path expression (string) and parses it into an array
of property names (strings, symbols or numbers). If not supplied, a
[default parser](#parser) is used which supports an extended version of
JavaScript's native path [syntax](#path-syntax).

# DEVELOPMENT

<details>

## NPM Scripts

The following NPM scripts are available:

- build - compile the library for testing and save to the target directory
- build:release - compile the library for release and save to the target directory
- clean - remove the target directory and its contents
- doctoc - generate the README's TOC (table of contents)
- rebuild - clean the target directory and recompile the library
- test - recompile the library and run the test suite
- test:run - run the test suite
- typecheck - sanity check the library's type definitions

</details>

# COMPATIBILITY

- Environments with support for ES6 and
  [`Array#flat`][flat]/[`Array#flatMap`][flatMap]
  ([polyfill](https://www.npmjs.com/package/array-flat-polyfill))

# SEE ALSO

- [dot-wild-tiny](https://www.npmjs.com/package/dot-wild-tiny)
- [just-safe-get](https://www.npmjs.com/package/just-safe-get)
- [lodash.get](https://www.npmjs.com/package/lodash.get)
- [object-path-wild](https://www.npmjs.com/package/object-path-wild)
- [@gizt/selector](https://www.npmjs.com/package/@gizt/selector)

# VERSION

0.1.0

# AUTHOR

[chocolateboy](https://github.com/chocolateboy)

# COPYRIGHT AND LICENSE

Copyright © 2020 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the
terms of the [Artistic License 2.0](https://www.opensource.org/licenses/artistic-license-2.0.php).

[flat]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
[flatMap]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap
[globs]: https://en.wikipedia.org/wiki/Glob_(programming)
[jsDelivr]: https://cdn.jsdelivr.net/npm/get-wild@0.1.0/dist/index.umd.min.js
[map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
[unpkg]: https://unpkg.com/get-wild@0.1.0/dist/index.umd.min.js
