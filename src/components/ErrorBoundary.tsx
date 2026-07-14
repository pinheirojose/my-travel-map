import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
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
      return (
        <div className="flex min-h-dvh items-center justify-center bg-background p-6">
          <div className="max-w-md space-y-4 text-center">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              The app hit an unexpected error. Try clearing saved data and reloading.
            </p>
            <pre className="rounded-lg bg-muted p-3 text-left text-xs overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('travel-map-storage-v1')
                  window.location.reload()
                }}
              >
                Clear data & reload
              </Button>
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
