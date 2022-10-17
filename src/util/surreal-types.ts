export type SurrealDatabase<DB> = DB & {
  [K in SurrealRecordId<DB>]: K extends `${infer TB}:${string}` ? (TB extends keyof DB ? DB[TB] : never) : never
}

export type SurrealRecordId<DB> = keyof DB extends string ? `${keyof DB}:${Letter | Digit}${string}` : never

type Letter =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type AnyTable<DB> = keyof DB extends string ? (keyof DB extends `${infer TB}:${string}` ? TB : never) : never
