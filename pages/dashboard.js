import { useState } from "react"
import { useSession, getSession } from "next-auth/react"
import { connect } from "../lib/database"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"

import { postData } from "../utils/postData"

const Page = ({ tasksFromServer, NEXTAUTH_URL }) => {
  const [tasks, setTasks] = useState(tasksFromServer)

  const { data: session, status } = useSession()
  const loading = status === "loading"

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null

  const handlClick = async () => {
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

export const getServerSideProps = async (context) => {
  try {
    ////
    const { db } = await connect()

    const collection = db.collection("tasks")

    const documents = await collection.find({}).toArray()
    const documentsWithId = documents.map((d) => ({
      ...d,
      _id: d._id.toString(),
    }))
    ////

    // const documentsWithId = [
    //   {
    //     _id: "123",
    //     uid: "lydstyl@gmail.com",
    //     name: "new task",
    //     description: "description",
    //     dueDate: "",
    //     labels: [],
    //     activities: [],
    //     checklists: [],
    //     files: [],
    //   },
    // ]

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
