import type { NextPage, GetServerSideProps } from "next"
import { useSession } from "next-auth/react"
import { connect } from "../lib/database"
import Layout from "../components/layout"
import AccessDenied from "../components/access-denied"

// Example POST method implementation:
async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

const Page: NextPage = ({ tasks,NEXTAUTH_URL }) => {
  tasks = JSON.parse(tasks)

  const { data: session, status } = useSession()
  const loading = status === "loading"

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== "undefined" && loading) return null

  const handlClick = ()=>{
    console.log(`gb🚀 ~ handlClick ~ handlClick`, handlClick)

    postData(`${NEXTAUTH_URL}/api/tasks`, { answer: 42 })
  .then(data => {
    console.log(data); // JSON data parsed by `data.json()` call
  });
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
    props: { tasks,NEXTAUTH_URL:process.env.NEXTAUTH_URL },
  }
}

export default Page
