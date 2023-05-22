import type {CompiledQuery} from 'kysely'

export function resolveBasePath(hostname: string): string {
  const protocol = hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1') ? 'http' : 'https'

  return `${protocol}://${hostname}`
}

export function serializeQuery(compiledQuery: CompiledQuery): string {
  const {parameters, sql} = compiledQuery

  if (!parameters.length) {
    return `${sql};`
  }

  return (
    [
      ...parameters.map(
        (parameter, index) =>
          `let $${index + 1} = ${
            typeof parameter === 'string' && parameter.startsWith('SURREALQL::')
              ? parameter.replace(/^SURREALQL::(\(.+\))/, '$1')
              : JSON.stringify(parameter)
          }`,
      ),
      sql,
      '',
    ].join(';') + ';'
  )
}
