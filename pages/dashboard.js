import { useState } from "react"
import { useSession, getSession } from "next-auth/react"
import { connect } from "../lib/database"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"

import { postData, deleteData } from "../utils/CRUD"

const Page = ({ tasksFromServer, NEXTAUTH_URL }) => {
  const [tasks, setTasks] = useState(tasksFromServer)

  const { data: session, status } = useSession()
  const loading = status === "loading"

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null

  const addTask = async () => {
    const body = {
      name: "new task",
      description: "description",
      dueDate: "",
      labels: [],
      activities: [],
      checklists: [],
      files: [],
    }
    if (session && session.user) {
      body.uid = session.user.email
    }
    const response = await postData(`${NEXTAUTH_URL}/api/tasks`, body)
    body._id = response.insertedId
    // show all tasks with the new one
    setTasks([...tasks, body])
  }

  const removeTask = async (id) => {
    await deleteData(`${NEXTAUTH_URL}/api/tasks/${id}`)

    setTasks(tasks.filter((task) => task._id !== id))
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

      <button onClick={addTask}>Add a task</button>

      <ul>
        {tasks.map((task) => (
          <li onClick={() => removeTask(task._id)} key={task._id}>
            {task._id} / {task.uid} / {task.name}
          </li>
        ))}
      </ul>

      <pre>{JSON.stringify(tasks, null, 4)}</pre>
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
