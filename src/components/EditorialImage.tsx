import { useState } from 'react'
import { cn } from '@/lib/cn'

interface Props {
  src: string
  /** Used when `src` is missing — lets real photography drop in later. */
  fallback: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  /** CSS object-position, e.g. "72% 50%". */
  position?: string
}

/**
 * Full-bleed image that quietly falls back when the intended photograph has
 * not been shot yet, so a missing file never leaves a hole in the layout.
 */
export function EditorialImage({ src, fallback, alt, className, priority, sizes, position }: Props) {
  const [source, setSource] = useState(src)

  return (
    <img
      src={source}
      alt={alt}
      sizes={sizes}
      onError={() => setSource((current) => (current === src ? fallback : current))}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      style={position ? { objectPosition: position } : undefined}
      className={cn('size-full object-cover', className)}
    />
  )
}
