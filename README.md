# get-wild

[![Build Status](https://github.com/chocolateboy/get-wild/workflows/test/badge.svg)](https://github.com/chocolateboy/get-wild/actions?query=workflow%3Atest)
[![NPM Version](https://img.shields.io/npm/v/get-wild.svg)](https://www.npmjs.org/package/get-wild)

<!-- TOC -->

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
  - [get-wild](#get-wild-default)
    - [get](#get)
    - [getter](#getter)
    - [split](#split)
  - [get-wild/fp](#get-wild-fp)
    - [get](#get-fp)
    - [getter](#getter-fp)
- [OPTIONS](#options)
  - [collect](#collect)
  - [default](#default)
  - [flatMap](#flatmap)
  - [map](#map)
  - [split](#options-parser)
- [DEVELOPMENT](#development)
- [COMPATIBILITY](#compatibility)
- [SEE ALSO](#see-also)
- [VERSION](#version)
- [AUTHOR](#author)
- [COPYRIGHT AND LICENSE](#copyright-and-license)

<!-- TOC END -->

# NAME

get-wild - extract nested properties from an object with support for wildcards

# FEATURES

- configurable wildcard support, e.g. `"foo.*.bar"`
- support for negative array indices, e.g. `"foo[-1].bar"`
- pluggable path parser
- no dependencies
- ~750 B minified + gzipped
- curried (data last) versions for functional programming
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

<!-- TOC:ignore -->
#### Flatten results

```javascript
get(data, 'users.*.hobbies')
// ["eating", "sleeping", undefined, "singing", "dancing"]
```

<!-- TOC:ignore -->
#### Remove missing results

```javascript
get(data, 'users.*.hobbies', [])
// ["eating", "sleeping", "singing", "dancing"]
```

<!-- TOC:ignore -->
#### Raw results

```javascript
get(data, 'users.**.hobbies')
// [["eating", "sleeping"], undefined, ["singing", "dancing"]]
```

# DESCRIPTION

This module exports a function which can be used to extract nested properties
from an object, including arrays and any other non-falsey values. This is
similar to the `get` function provided by Lodash (and many other libraries),
but it adds the following features:

  - wildcard support, e.g. `"foo.*.bar.*.baz"`
  - support for negative array indices, e.g. `"foo[-1][-2]"`

In addition to the default [`get`](#get) implementation, get-wild exports a
builder function ([`getter`](#getter)) which can be used to create a custom
`get` with different [options](#options) baked in, as well as curried
(data last) versions of [`get`](#get-fp) and [`getter`](#getter-fp) to
facilitate functional composition and reuse.

## Why?

I needed a small, dependency-free version of [`Lodash.get`][Lodash.get] with wildcard
support, and preferably with an option to filter out/exclude missing values.
Although there are a huge number of `get` implementations on NPM, I could only
find one or two with wildcard support and none that are
standalone/dependency-free.

## Why not?

If you don't need support for wildcards, negative array-indices, or other
[options](#options), there are smaller implementations, e.g.
[dlv][].

# TYPES

The following types are referenced in the descriptions below.

```typescript
type Options = {
    collect?: (value: {}) => Array<any>;
    default?: any;
    flatMap?: PropertyKey | false;
    map?: PropertyKey | false;
    parser?: Options['split'];
    split?: string | Parser;
};

type Parser = (path: string) => Array<PropertyKey>;
type Path = PropertyKey | Array<PropertyKey>;
```

# EXPORTS

<a name="get-wild-default"></a>
## get-wild

### get

- **Type**: `<T = any>(obj: any, path: Path, $default?: any) => T`

```javascript
import { get } from 'get-wild'

get(obj, 'foo.*.bar', [])
```

Takes an object, a path and an optional default value, and returns the
value(s) found in the object at the specified path, or the default value
(which is undefined by default) if the path doesn't exist or the value is
undefined. The path can be supplied as a dotted expression (string), symbol
or number, or an array of strings, symbols or numbers.

The [syntax](#path-syntax) of dotted path expressions mostly matches that of
regular JavaScript path expressions, with a few additions.

If there are no steps in the path, the object itself is returned (or the
default value if the object is undefined).

Wildcard matching is performed by [`collect`](#collect)ing an array of values
at the wildcard's location and recursively [`get`](#get)ting the remainder of
the path from each value. Wildcards can be used at any locations in a path to
turn a single lookup into an array of lookup results for values at that
location.

The values returned by wildcard matches can be customized. By default, `*`
flattens the results (using [`flatMap`][flatMap]), while `**` uses
[`map`][map], which returns the results verbatim, though this mapping can be
configured (or disabled) via the [`map`](#map) and [`flatMap`](#flatmap)
options.

The `get` export is generated by a builder function, [`getter`](#getter), which
can be used to create a custom `get` function with different options.

### getter

- **Type**: `(options?: Options) => <T = any>(obj: any, path: Path, $default?: any) => T`

```javascript
import { getter } from 'get-wild'

const get = getter({ split: '/' })
const obj = { foo: { bar: { baz: 42 } } }

get(obj, 'foo/bar/baz') // 42
```

`getter` is a function which is used to build `get` functions. The default
`get` export is generated by calling `getter` with no arguments, which uses the
following default [options](#options):

```javascript
    {
        collect: Object.values,
        default: undefined,
        flatMap: '*',
        map: '**',
        split: defaultParser,
    }
```

The behavior of `get` can be configured by generating a custom version which
overrides these defaults, e.g.:

```javascript
import { getter } from 'get-wild'

const split = path => path.split('/')
const get = getter({ split })

get(obj, 'foo/bar/*/quux')
```

### split

- **Type**: `Parser`
- **Aliases**: parse, parser

```javascript
import { getter, split } from 'get-wild'
import memoize from '@example/memoizer'

const memoized = memoize(split)
const get = getter({ split: memoized })

get(obj, '...')
```

The default function used by [`get`](#get) to turn a path expression (string)
into an array of steps (strings, symbols or numbers).

The array is not mutated, so, e.g., the function can be memoized to avoid
re-parsing long/frequently-used paths. Alternatively, the path can be
pre-parsed into an array (this is done automatically if the curried versions
are used).

<a name="path-syntax"></a>
<!-- TOC:ignore -->
#### Syntax

The parser supports an extended version of JavaScript's native path syntax,
e.g. the path:

```javascript
`a[-1].b[42]["c.d"].e['f g'].*.h["i \\"j\\" k"][""]`
```

is parsed into the following steps:

```javascript
['a', -1, 'b', 42, 'c.d', 'e', 'f g', '*', 'h', 'i "j" k', '']
```

Properties are either unquoted names (strings), bracketed integers, or
bracketed single or double-quoted strings. Integers can be signed (`-1`, `+42`)
or unsigned (`42`). Unquoted names can contain any characters apart from spaces
(`\s`), `"`, `'`, <code>&#96;</code>, `[`, `]`, `.` or `\`.

Unquoted property names must be preceded by a dot unless the name is at the
start of the path, in which case the dot must be omitted. Bracketed values
must not be preceded by a dot.

If the path is an empty string, an empty array is returned.

<a name="get-wild-fp"></a>
## get-wild/fp

<a name="get-fp"></a>
### get

- **Type**: `<T = any>(path: Path, $default?: any) => <U = T>(obj: any) => U`

```javascript
import { get } from 'get-wild/fp'

const followers = get('followers.*.name', [])

followers(user) // get(user, 'followers.*.name', [])

const allFollowers = users.flatMap(followers)
```

A curried version of [`get`](#get) which takes a path and an optional default
value and returns a function which takes an object and returns the value(s)
located at the path.

<a name="getter-fp"></a>
### getter

- **Type**: `(options?: Options) => <T = any>(path: Path, $default?: any) => <U = T>(obj: any) => U`

```javascript
import { getter } from 'get-wild/fp'

const get = getter({ default: [], split: '.' })
const followers = get('followers.*.name')

followers(user) // get(user, 'followers.*.name', [])

const allFollowers = users.flatMap(followers)
```

A variant of [`getter`](#getter) which takes an optional [Options](#options)
object and returns a [curried version of `get`](#get-fp) with the options baked
in.

# OPTIONS

## collect

- **Type**: `(value: {}) => Array<any>`
- **Default**: `Object.values`

```javascript
import { getter } from 'get-wild'

const collect = value => {
    return (value instanceof Map || value instanceof Set)
        ? Array.from(value.values())
        : Object.values(value)
}

const map = new Map([
    [1, { value: 'foo' }],
    [2, { value: 'bar' }],
    [3, { value: 'baz' }],
    [4, { value: 'quux' }],
])

const obj = { map }
const get = getter({ collect })

get(obj, 'map.*.value') // ["foo", "bar", "baz", "quux"]
```

The `collect` function is used to convert a value under a wildcard token into
an array of values. If not supplied, it defaults to
[`Object.values`][Object.values], which works with objects, arrays, and other
non-nullish values. It can be overridden to add support for traversable values
that aren't plain objects or arrays, e.g. ES6 Map and Set instances.

Note that the value passed to `collect` is not falsey and not an array, as both
are handled without calling `collect`.

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

If set to false, wildcard matching with `flatMap` is disabled and the token is
treated as a regular property name.

<!-- TOC:ignore -->
### Usage

Wildcard matching with `flatMap` behaves in a similar way to directory/filename
matching with [globs][] (minus the pattern matching). The selected properties
(at the end of the path) are returned as direct children of the resulting array
(wildcard matches always return an array), either as matched results or as
default values if there's no match.

For example, with the default mapping, a path such as
`accounts.active.*.followers.*.name`, which extracts the names of all followers
of active accounts, would return an array of account names interspersed with
default values where an account doesn't have any followers (or if a follower's
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

<!-- TOC:ignore -->
### Syntax

Note that with the [default parser](#split), the token must be a
[syntactically-valid](#path-syntax) name, e.g. this doesn't work:

```javascript
import { getter } from 'get-wild'

const obj = { foo: [{ bar: 1 }, { bar: 2 }] }
const get = getter({ flatMap: '[]' })

get(obj, 'foo.[].bar') // SyntaxError: Invalid step @ 3: "foo.[].bar"
```

If a [custom parser](#options-parser) is supplied, any token can be used:

```javascript
const get = getter({ flatMap: '[]', split: '.' })

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

Matching with `map` selects the same values as `flatMap`, but they remain
nested inside arrays, with each enclosing `map` in the path adding another
layer of wrapping.

If set to false, wildcard matching with `map` is disabled and the token is
treated as a regular property name.

<a name="options-parser"></a>
## split

- **Type**: `string | Parser`
- **Default**: [`split`](#split)
- **Alias**: parser

```javascript
import { getter } from  'get-wild'

const split = path => path.split('.')
const get = getter({ split })
const obj = { '': { '': 42 } }

get(obj, '.') // 42
```

A function which takes a path expression (string) and parses it into an array
of property names (strings, symbols or numbers). If not supplied, a
[default parser](#split) which supports an extended version of JavaScript's
native path [syntax](#path-syntax) is used.

As a shortcut, if the value is a string, a function which splits the path on
that string is used, i.e. the following are equivalent:

```javascript
const split = path => path.split('.')
const get = getter({ split })
```

```javascript
const get = getter({ split: '.' })
```

# DEVELOPMENT

<details>

<!-- TOC:ignore -->
## NPM Scripts

The following NPM scripts are available:

- build - compile the library for testing and save to the target directory
- build:doc - generate the README's TOC (table of contents)
- build:release - compile the library for release and save to the target directory
- clean - remove the target directory and its contents
- rebuild - clean the target directory and recompile the library
- repl - launch a node REPL with the library loaded
- test - recompile the library and run the test suite
- test:run - run the test suite
- typecheck - sanity check the library's type definitions

</details>

# COMPATIBILITY

- [Maintained Node.js versions](https://github.com/nodejs/Release#readme) and compatible browsers

# SEE ALSO

- [@gizt/selector](https://www.npmjs.com/package/@gizt/selector)
- [dot-wild-tiny](https://www.npmjs.com/package/dot-wild-tiny)
- [jsonpath](https://www.npmjs.com/package/jsonpath)
- [object-path-wild](https://www.npmjs.com/package/object-path-wild)
- [qim](https://www.npmjs.com/package/qim)

# VERSION

2.0.0

# AUTHOR

[chocolateboy](https://github.com/chocolateboy)

# COPYRIGHT AND LICENSE

Copyright © 2020-2022 by chocolateboy.

This is free software; you can redistribute it and/or modify it under the terms
of the [MIT license](https://opensource.org/licenses/MIT).

[dlv]: https://www.npmjs.com/package/dlv
[flat]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
[flatMap]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap
[globs]: https://en.wikipedia.org/wiki/Glob_(programming)
[jsDelivr]: https://cdn.jsdelivr.net/npm/get-wild
[Lodash.get]: https://www.npmjs.com/package/lodash.get
[map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
[Object.values]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values
[polyfill]: https://www.npmjs.com/package/array-flat-polyfill
[unpkg]: https://unpkg.com/get-wild
