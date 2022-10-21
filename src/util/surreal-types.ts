import type {Generated} from 'kysely'

export type SurrealDatabase<DB> = {
  [K in keyof DB | SurrealRecordId<DB>]: K extends `${infer TB}:${string}`
    ? TB extends keyof DB
      ? SurrealRecord<DB[TB]>
      : never
    : K extends keyof DB
    ? SurrealRecord<DB[K]>
    : never
}

export type SurrealRecordId<DB> = keyof DB extends string ? `${keyof DB}:${string}` : never

export type SurrealRecord<R> = {
  [C in 'id' | keyof R]: C extends 'id' ? Generated<string> : C extends keyof R ? R[C] : never
}

export type AnyTable<DB, TB extends keyof DB = keyof DB> = TB extends `${infer T}:${string}`
  ? T
  : TB extends string
  ? TB
  : never
