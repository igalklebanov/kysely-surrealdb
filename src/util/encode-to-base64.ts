export function encodeToBase64(str: string): string {
  return typeof process === 'undefined' ? btoa(str) : Buffer.from(str).toString('base64')
}
