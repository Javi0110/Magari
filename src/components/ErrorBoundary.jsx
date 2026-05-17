import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <h1 className="font-serif text-2xl text-neutral-800 mb-2">Something went wrong</h1>
            <p className="text-neutral-600 text-sm mb-6">
              Please refresh the page or return home. If this keeps happening, contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
              <Link to="/" className="btn-outline">
                Home
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
