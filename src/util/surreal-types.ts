import type {ColumnType, GeneratedAlways} from 'kysely'

/**
 * Enhances a regular database interface with SurrealDB stuff.
 *
 * Automatically adds id columns, and edges' (see {@link SurrealEdge}) in-out columns
 * so you don't have to.
 *
 * When using {@link SurrealKysely}, you only need to pass your regular database
 * interface - the wrapper does the wrapping for you under the hood.
 *
 * ### Examples
 *
 * ```ts
 * interface Person {
 *   first_name: string
 *   last_name: string
 * }
 *
 * interface Pet {
 *   name: string
 *   species: 'cat' | 'dog'
 * }
 *
 * interface Own {
 *   time: {
 *     adopted: string
 *   }
 * }
 *
 * interface Database {
 *   person: Person
 *   own: SurrealEdge<Own>
 *   pet: Pet
 * }
 *
 * SurrealDatabase<Database>
 * ```
 *
 * @typeParam DB - The database interface type. Keys of this type must be table names
 *    in the database and values must be interfaces that describe the rows in those
 *    tables. See the examples above.
 */
export type SurrealDatabase<DB> = {
  [K in keyof DB | SurrealRecordId<DB>]: K extends `${infer TB}:${string}`
    ? TB extends keyof DB
      ? SurrealRecordOrEdge<DB, TB>
      : never
    : K extends keyof DB
    ? SurrealRecordOrEdge<DB, K>
    : never
}

export type SurrealRecordId<DB, TB extends keyof DB = keyof DB> = TB extends string ? `${TB}:${string}` : never

export type SurrealRecordOrEdge<DB, TB extends keyof DB> = DB[TB] extends SurrealEdge<any>
  ? {
      [C in 'id' | 'in' | 'out' | keyof DB[TB]]: C extends 'id'
        ? ColumnType<SurrealRecordId<DB, TB>, string | undefined, string | undefined>
        : C extends 'in' | 'out'
        ? GeneratedAlways<SurrealRecordId<DB>>
        : C extends keyof DB[TB]
        ? DB[TB][C]
        : never
    }
  : SurrealRecord<DB, TB>

export type SurrealRecord<DB, TB extends keyof DB> = {
  [C in 'id' | keyof DB[TB]]: C extends 'id'
    ? ColumnType<SurrealRecordId<DB, TB>, string | undefined, string | undefined>
    : C extends keyof DB[TB]
    ? DB[TB][C]
    : never
}

/**
 * Gives a hint to {@link SurrealDatabase} that the given table is a graph edge.
 *
 * These tables can act as graph edges between two records in {@link SurrealKysely.relate | relate}
 * queries.
 *
 * ### Examples
 *
 * ```ts
 * interface Database {
 *   person: Person
 *   own: SurrealEdge<Own>
 *   pet: Pet
 * }
 * ```
 *
 * @typeParam E - An interface representing the edge's unreserved columns structure.
 */
export type SurrealEdge<E> = {
  [K in '__edge' | keyof E]: K extends '__edge' ? ColumnType<never, never, never> : K extends keyof E ? E[K] : never
}

export type AnyEdge<DB> = {
  [K in keyof DB]: DB[K] extends SurrealEdge<DB[K]> ? (K extends string ? K : never) : never
}[keyof DB]

export type AnySpecificVertex<DB> = {
  [K in keyof DB]: DB[K] extends SurrealEdge<DB[K]> ? never : SurrealRecordId<DB, K>
}[keyof DB]

export type AnyVertexGroup<DB> = {
  [K in keyof DB]: K extends AnyEdge<DB>
    ? never
    : K extends `${string}:${string}`
    ? never
    : K extends string
    ? K
    : never
}[keyof DB]
