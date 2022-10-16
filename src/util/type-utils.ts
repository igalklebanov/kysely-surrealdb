/**
 * Takes all properties from T1 and merges all properties from T2
 * that don't exist in T1 as optional properties.
 *
 * Example:
 *
 * interface Person {
 *   name: string
 *   age: number
 * }
 *
 * interface Pet {
 *   name: string
 *   species: 'cat' | 'dog'
 * }
 *
 * type Merged = MergePartial<Person, Pet>
 *
 * // { name: string, age: number, species?: 'cat' | 'dog' }
 */
export type MergePartial<T1, T2> = T1 & Partial<Omit<T2, keyof T1>>
