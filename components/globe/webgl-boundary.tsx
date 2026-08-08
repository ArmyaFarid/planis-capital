"use client"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback: ReactNode
  onError?: () => void
}

interface State {
  failed: boolean
}

/**
 * Catches anything the 3D subtree throws — shader compile failures, driver quirks, a
 * chunk that fails to download — and swaps in the 2D globe.
 *
 * A probe alone is not enough: `getContext('webgl')` succeeding says nothing about
 * whether the scene will actually render on that GPU.
 */
export class WebGLBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    // Surfaced rather than swallowed: a silent fallback hides real regressions.
    console.warn("[globe] 3D scene failed, falling back to 2D:", error)
    this.props.onError?.()
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
