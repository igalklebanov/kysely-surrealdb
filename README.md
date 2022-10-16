# kysely-surrealdb

![Powered by TypeScript](https://img.shields.io/badge/powered%20by-typescript-blue.svg)

[Kysely](https://github.com/koskimas/kysely) dialects, plugins and other goodies for [SurrealDB](https://www.surrealdb.com/).

[SurrealQL](https://surrealdb.com/docs/surrealql) is based on SQL, so why not? :trollface:

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

### HTTP Dialect

[SurrealDB](https://www.surrealdb.com/)'s [HTTP endpoints](https://surrealdb.com/docs/integration/http) allows executing [SurrealQL](https://surrealdb.com/docs/surrealql) queries in the browser and is a great fit for serverless functions and other auto-scaling compute services.

#### Node.js 16.8+

Older node versions are supported as well, just swap [`undici`](https://github.com/nodejs/undici) with [`node-fetch`](https://github.com/node-fetch/node-fetch).

```ts
import {Kysely} from 'kysely'
import {SurrealDatabase, SurrealDbHttpDialect} from 'kysely-surrealdb'
import {fetch} from 'undici'

interface Database {
  person: {
    id: GeneratedAlways<string>
    first_name: string | null
    last_name: string | null
    age: number
  }
  pet: {
    id: GeneratedAlways<string>
    name: string
    owner_id: string | null
  }
}

const db = new Kysely<SurrealDatabase<Database>>({
  dialect: new SurrealDbHttpDialect({
    database: '<database>',
    fetch,
    hostname: '<hostname>',
    namespace: '<namespace>',
    password: '<password>',
    username: '<username>',
  }),
})
```

### Web Socket Dialect - Soon<sup>TM</sup>

### SurrealKysely Query Builder

The awesomeness of Kysely, with some SurrealQL query builders patched in.

```ts
import {Kysely} from 'kysely'
import {SurrealDatabase, SurrealDbHttpDialect} from 'kysely-surrealdb'
import {fetch} from 'undici'

interface Database {
  person: {
    id: string
    first_name: string | null
    last_name: string | null
  }
  pet: {
    id: string
    name: string
    owner_id: string
  }
}

const db = new SurrealKysely<Database>({
  dialect: new SurrealDbHttpDialect({
    database: '<database>',
    fetch,
    hostname: '<hostname>',
    namespace: '<namespace>',
    password: '<password>',
    username: '<username>',
  }),
})

await db
  .create('person:100')
  .set({
    first_name: 'Jennifer',
    age: 15,
  })
  .return('none')
  .execute()
```

## License

MIT License, see `LICENSE`
