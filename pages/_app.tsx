import React, { useReducer, createContext, FC } from "react"

import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app"
import "./styles.css"

export const TasksContext = createContext<
  [State, React.Dispatch<{ type: string }>] | null
>(null)
export interface Action {
  type: string
  [key: string]: any // payload can have different names
}

export interface Task {
  _id: string
  uid: string
  name: string
  description: string
  dueDate: string
  links?: []
  labels?: []
  activities?: []
  checklists?: []
  files?: []
}

export interface State {
  tasks: Task[]
  isLoading: boolean
  hasError: boolean
  message?: string
}

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case "setLoading":
      state = { ...state, isLoading: action.isLoading }
      return state
    case "setError":
      state = {
        ...state,
        hasError: true,
        message: action.message,
        isLoading: false,
      }
      return state
    case "setTasks":
      state = {
        ...state,
        hasError: false,
        tasks: action.payload,
        isLoading: false,
      }
      return state
    case "addTask":
      state = {
        ...state,
        hasError: false,
        tasks: [...state.tasks, action.payload],
        isLoading: false,
      }
      return state
    case "removeTask":
      state = {
        ...state,
        hasError: false,
        tasks: [...state.tasks.filter((task) => task._id !== action.taskId)],
        isLoading: false,
      }
      return state
    default:
      return state
  }
}

const TasksContextProvider: FC = ({ children }) => (
  <TasksContext.Provider
    value={useReducer<React.Reducer<State, { type: string }>>(reducer, {
      tasks: [],
      isLoading: false,
      hasError: false,
    })}
  >
    {children}
  </TasksContext.Provider>
)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider
      // Provider options are not required but can be useful in situations where
      // you have a short session maxAge time. Shown here with default values.
      session={pageProps.session}
    >
      <TasksContextProvider>
        <Component {...pageProps} />
      </TasksContextProvider>
    </SessionProvider>
  )
}
