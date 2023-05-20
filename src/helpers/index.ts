import {sql} from 'kysely'

export const FALSE = sql<false>`false`

export const NONE = sql<never>`none`

export const NULL = sql<null>`null`

export const TRUE = sql<true>`true`
