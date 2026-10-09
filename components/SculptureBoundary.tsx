"use client";

import { Component, type ReactNode } from "react";

type Props = {
  /** Shown if the sphere throws while mounting (e.g. WebGL context creation fails). */
  fallback: ReactNode;
  onError?: (error: Error) => void;
  children: ReactNode;
};

type State = { failed: boolean };

/*
 * Catches devices that pass detection but still can't run the sphere.
 * React Three Fiber rethrows renderer errors into the React tree, so this
 * boundary sees them.
 */
export default class SculptureBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
