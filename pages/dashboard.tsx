import type { NextPage, GetServerSideProps } from "next"
import { useSession } from "next-auth/react"
import { connect } from "../lib/database"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"

const Page: NextPage = ({ tasks }) => {
  tasks = JSON.parse(tasks)

  const { data: session, status } = useSession()
  const loading = status === "loading"

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null

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
      <pre>{JSON.stringify(tasks, null, 4)}</pre>
      <p>> {tasks[0].name}</p>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { db } = await connect()

  const collection = db.collection("tasks")

  const documents = await collection.find({}).toArray()
  const tasks = JSON.stringify(documents)

  return {
    props: { tasks },
  }
}

export default Page
