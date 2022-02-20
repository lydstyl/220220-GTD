import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import { connect } from "../../lib/database"

interface Haiku {
  title: string
  content: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })

  if (session) {
    if (req.method === "POST") {
      // POST /api/tasks add new task in db
      try {
        const body = req.body

        const { db } = await connect()
        const haiku = db.collection<Haiku>("tasks")
        const result = await haiku.insertOne(body)

        const { insertedId } = result
        res.status(201)
        return res.json({
          insertedId,
          msg: `A document was inserted with the _id: ${insertedId}`,
        })
      } catch (error) {
        console.log(`gb🚀 ~ error`, error)
        res.status(500)
        return res.json({
          error: true,
          msg: `Something whent wrong.`,
        })
      }
    } else if (req.method === "GET") {
      // GET /api/tasks get all tasks
      return res.json({
        msg: `Get all tasks.`,
      })
    } else {
      // Handle any other HTTP method
      res.status(500)
      return res.json({
        error: true,
        msg: `Something whent wrong.`,
      })
    }
  }
  {
    res.send({
      error: "You must be sign in to view the protected content on this page.",
    })
  }
}
