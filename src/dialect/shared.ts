export function resolveBasePath(hostname: string): string {
  const protocol = hostname.startsWith('localhost') ? 'http' : 'https'

  return `${protocol}://${hostname}`
}
