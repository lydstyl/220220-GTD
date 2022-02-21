import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import { ObjectId } from "mongodb"

import { connect } from "../../../lib/database"

export default async function jwt(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })

  if (session) {
    if (req.method === "DELETE") {
      try {
        const { db } = await connect()
        const tasks = db.collection("tasks")
        const { id } = req.query

        const result = await tasks.deleteOne({
          _id: new ObjectId(id.toString()),
        })

        return res.json({
          sucess: true,
          msg: `todo delete ${id}`,
          deletedTaskId: id,
        })
      } catch (error) {
        console.log(`gb🚀 ~ jwt ~ error`, error)
        res.status(500)
        return res.json({
          error: true,
          msg: `Something whent wrong.`,
        })
      }
    }
  } else {
    res.send({
      error: "You must be sign in to view the protected content on this page.",
    })
  }
}
