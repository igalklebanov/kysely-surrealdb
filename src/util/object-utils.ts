export function freeze<T>(obj: T): Readonly<T> {
  return Object.freeze(obj)
}

export function isReadonlyArray(obj: unknown): obj is ReadonlyArray<any> {
  return Array.isArray(obj)
}
