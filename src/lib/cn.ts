/** Minimal class-name joiner — avoids pulling in clsx for four lines of logic. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
