# kysely-surrealdb

![Powered by TypeScript](https://img.shields.io/badge/powered%20by-typescript-blue.svg)

[Kysely](https://github.com/koskimas/kysely) dialects, plugins and other goodies for [SurrealDB](https://www.surrealdb.com/).

## Installation

#### NPM 7+

```bash
npm i kysely-surrealdb
```

#### NPM <7

```bash
npm i kysely-surrealdb kysely
```

#### Yarn

```bash
yarn add kysely-surrealdb kysely
```

#### PNPM

```bash
pnpm add kysely-surrealdb kysely
```

### Deno

This package uses/extends some [Kysely](https://github.com/koskimas/kysely) types and classes, which are imported using it's NPM package name -- not a relative file path or CDN url.

To fix that, add an [`import_map.json`](https://deno.land/manual@v1.26.1/linking_to_external_code/import_maps) file.

```json
{
  "imports": {
    "kysely": "https://cdn.jsdelivr.net/npm/kysely@0.22.0/dist/esm/index.js"
  }
}
```

## Usage

### Rest Dialect

TODO: ...

### "Classic" Dialect - Soon<sup>TM</sup>

## License

MIT License, see `LICENSE`
