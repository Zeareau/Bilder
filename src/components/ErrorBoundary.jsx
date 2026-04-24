import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error, info) { console.error('ErrorBoundary caught', error, info) }
  render() {
    if (this.state.hasError) return (
      <div className="bg-rose-900/5 p-4 rounded text-rose-300">Something went wrong rendering this section.</div>
    )
    return this.props.children
  }
}
