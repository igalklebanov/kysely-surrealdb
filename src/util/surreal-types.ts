export type SurrealDatabase<DB> = {
  [K in keyof DB | SurrealRecordId<DB>]: K extends `${infer TB}:${string}`
    ? TB extends keyof DB
      ? DB[TB]
      : never
    : K extends keyof DB
    ? DB[K]
    : never
}

export type SurrealRecordId<DB> = keyof DB extends string ? `${keyof DB}:${string}` : never

export type AnyTable<DB, TB extends keyof DB = keyof DB> = TB extends `${infer T}:${string}`
  ? T
  : TB extends string
  ? TB
  : never
