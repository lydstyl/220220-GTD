import React, { useReducer, createContext, FC } from "react"

import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"
import "./styles.css"

export const CounterContext = createContext<
  [number, React.Dispatch<{ type: string }>] | null
>(null)

const reducer = (state: number, action: { type: string }) => {
  switch (action.type) {
    case "add":
      return state + 1
    case "subtract":
      return state - 1
    default:
      return state
  }
}

export interface Action<T, P> {
  readonly type: T
  readonly payload?: P
}

const CounterContextProvider: FC = ({ children }) => (
  <CounterContext.Provider
    value={useReducer<React.Reducer<number, { type: string }>>(reducer, 0)}
  >
    {children}
  </CounterContext.Provider>
)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider
      // Provider options are not required but can be useful in situations where
      // you have a short session maxAge time. Shown here with default values.
      session={pageProps.session}
    >
      <CounterContextProvider>
        <Component {...pageProps} />
      </CounterContextProvider>
    </SessionProvider>
  )
}
