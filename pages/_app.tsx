import { useReducer, createContext } from "react"

import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"
import "./styles.css"

export const CounterContext = createContext(null)

const reducer = (state, action) => {
  switch (action.type) {
    case "add":
      return state + 1
    case "subtract":
      return state - 1
    default:
      return state
  }
}

const CounterContextProvider = ({ children }) => (
  <CounterContext.Provider value={useReducer(reducer, 0)}>
    {children}
  </CounterContext.Provider>
)

// Use the <SessionProvider> to improve performance and allow components that call
// `useSession()` anywhere in your application to access the `session` object.
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
