export type SurrealDatabase<DB> = DB & {
  [K in SurrealRecordId<DB>]: K extends `${infer TB}:${string}` ? (TB extends keyof DB ? DB[TB] : never) : never
}

export type SurrealRecordId<DB> = keyof DB extends string ? `${keyof DB}:${string}` : never

export type AnyTable<DB, TB extends keyof DB = keyof DB> = TB extends `${infer T}:${string}`
  ? T
  : TB extends string
  ? TB
  : never
