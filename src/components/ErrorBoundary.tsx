import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { detectBrowserLocale, getMessages } from '@/i18n'
import type { Locale } from '@/i18n'
import { STORAGE_KEY } from '@/utils/constants'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

function readStoredLocale(): Locale {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return detectBrowserLocale()
    const parsed = JSON.parse(raw) as {
      state?: { preferences?: { locale?: Locale } }
    }
    return parsed.state?.preferences?.locale ?? detectBrowserLocale()
  } catch {
    return detectBrowserLocale()
  }
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Travel Map render error:', error, info)
  }

  render() {
    if (this.state.error) {
      const messages = getMessages(readStoredLocale())
      return (
        <div className="flex min-h-dvh items-center justify-center bg-background p-6">
          <div className="max-w-md space-y-4 text-center">
            <h1 className="text-xl font-semibold">{messages.error.title}</h1>
            <p className="text-sm text-muted-foreground">
              {messages.error.description}
            </p>
            <pre className="rounded-lg bg-muted p-3 text-left text-xs overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY)
                  window.location.reload()
                }}
              >
                {messages.error.clearAndReload}
              </Button>
              <Button onClick={() => window.location.reload()}>
                {messages.error.reload}
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
