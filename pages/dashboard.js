import { useContext, useEffect } from "react"
import { useSession, getSession } from "next-auth/react"
import { TasksContext } from "./_app"
import { connect } from "../lib/database"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"
import TaskList from "../components/taskList"

import { postData, deleteData } from "../utils/CRUD"

const Page = ({ tasksFromServer, NEXTAUTH_URL }) => {
  const { data: session, status } = useSession()
  const [state, dispatch] = useContext(TasksContext)

  const isSessionLoading = status === "loading"
  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && isSessionLoading) return null

  useEffect(() => {
    dispatch({ type: "setLoading", isLoading: true })
    dispatch({ type: "setTasks", payload: tasksFromServer })
  }, [])

  const addTask = async () => {
    const newTask = {
      name: "new task",
      description: "description",
      dueDate: "",
      labels: [],
      activities: [],
      checklists: [],
      files: [],
    }
    if (session && session.user) {
      newTask.uid = session.user.email
    }

    try {
      dispatch({ type: "setLoading", isLoading: true })
      const response = await postData(`${NEXTAUTH_URL}/api/tasks`, newTask)
      newTask._id = response.insertedId

      dispatch({ type: "addTask", payload: newTask })
    } catch (error) {
      console.log(`gb🚀 ~ addTask ~ error`, error)
      dispatch({
        type: "setError",
        message: "Something when wrong while adding a new task.",
      })
    }
  }

  const removeTask = async (taskId) => {
    try {
      dispatch({ type: "setLoading", isLoading: true })
      await deleteData(`${NEXTAUTH_URL}/api/tasks/${taskId}`)

      dispatch({ type: "removeTask", taskId })
    } catch (error) {
      console.log(`gb🚀 ~ removeTask ~ error`, error)
    }
  }

  // If no session exists, display access denied message
  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    )
  }

  // If session exists, display content
  return (
    <Layout>
      <h1>Dashboard Protected Page</h1>
      {state.isLoading && <h2>Loading...</h2>}
      {state.hasError && <h2>ERROR : {state.message}</h2>}

      <button onClick={addTask}>Add a task</button>
      <pre>{JSON.stringify(state, null, 4)}</pre>

      <TaskList />

      <ul>
        {state.tasks.map((task) => (
          <li onClick={() => removeTask(task._id)} key={task._id}>
            {task._id} / {task.uid} / {task.name}
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export const getServerSideProps = async (context) => {
  try {
    const { db } = await connect()

    const collection = db.collection("tasks")

    const documents = await collection.find({}).toArray()
    const documentsWithId = documents.map((d) => ({
      ...d,
      _id: d._id.toString(),
    }))

    return {
      props: {
        tasksFromServer: documentsWithId,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        session: await getSession(context),
      },
    }
  } catch (error) {
    console.log(`gb🚀 ~ getServerSideProps ~ error`, error)
  }
}

export default Page
