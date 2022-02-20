import { useState } from "react"
import type { NextPage, GetServerSideProps } from "next"
import { useSession } from "next-auth/react"
import { connect } from "../lib/database"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"

import { postData } from "../utils/postData"

const Page: NextPage = ({ tasksFromServer, NEXTAUTH_URL }) => {
  const [tasks, setTasks] = useState(JSON.parse(tasksFromServer))

  const { data: session, status } = useSession()
  const loading = status === "loading"

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null

  const handlClick = async () => {
    const body = {
      uid: session.user.email,
      name: "new task",
      description: "description",
      dueDate: "",
      labels: [],
      activities: [],
      checklists: [],
      files: [],
    }

    const response = await postData(`${NEXTAUTH_URL}/api/tasks`, body)

    body._id = response.insertedId

    // show all tasks with the new one
    setTasks([...tasks, body])
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

      <button onClick={handlClick}>Add a task</button>

      <pre>{JSON.stringify(tasks, null, 4)}</pre>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { db } = await connect()

  const collection = db.collection("tasks")

  const documents = await collection.find({}).toArray()
  const tasksFromServer = JSON.stringify(documents)

  return {
    props: { tasksFromServer, NEXTAUTH_URL: process.env.NEXTAUTH_URL },
  }
}

export default Page
