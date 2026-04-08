'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class GtmErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-6 text-center space-y-2">
          <p className="text-sm font-medium text-red-400">GTM strategy failed to render</p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {this.state.message || 'An unexpected error occurred. Try refreshing the page.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="mt-2 text-xs text-teal-400 hover:text-teal-300 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
