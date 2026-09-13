import { Component, type ReactNode, type ErrorInfo } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  showDetails: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    showDetails: false,
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, showDetails: false })
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  private handleGoHome = (): void => {
    window.location.href = '/'
  }

  private toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }))
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#090C19',
            color: '#F0F4FF',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle glow background */}
          <div
            style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124, 93, 250, 0.15) 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'relative',
              maxWidth: '540px',
              width: '100%',
              backgroundColor: 'rgba(22, 29, 54, 0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(124, 93, 250, 0.15)',
            }}
          >
            {/* Icon Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.15), rgba(245, 166, 35, 0.15))',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                fontSize: '28px',
                marginBottom: '1.25rem',
              }}
            >
              🛡️
            </div>

            <h2
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                marginBottom: '0.75rem',
                color: '#F0F4FF',
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                color: '#9BA8C8',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '2rem',
              }}
            >
              Veritas caught an unhandled interface exception. Your session and learning progress are safe.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
              }}
            >
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7C5DFA, #4F6EF7)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(124, 93, 250, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                🔄 Reload App
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: 'rgba(28, 36, 66, 0.85)',
                  color: '#F0F4FF',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Try Again
              </button>

              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: '#9BA8C8',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Home
              </button>
            </div>

            {/* Error diagnostics toggle */}
            {this.state.error && (
              <div style={{ marginTop: '1rem', textAlign: 'left' }}>
                <button
                  onClick={this.toggleDetails}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#5A6580',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  {this.state.showDetails ? 'Hide error details' : 'View error details'}
                </button>

                {this.state.showDetails && (
                  <pre
                    style={{
                      marginTop: '0.75rem',
                      padding: '1rem',
                      borderRadius: '8px',
                      background: 'rgba(9, 12, 25, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      color: '#F87171',
                      fontSize: '0.75rem',
                      overflowX: 'auto',
                      maxHeight: '160px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {this.state.error.toString()}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
