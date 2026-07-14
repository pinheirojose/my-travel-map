import { useEffect, useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

/** Avoids Leaflet/React 19 StrictMode double-mount issues on first paint. */
export function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      fallback ?? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    )
  }

  return <div className="absolute inset-0">{children}</div>
}
