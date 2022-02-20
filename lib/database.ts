import { MongoClient, MongoClientOptions } from "mongodb"

const client = new MongoClient(
  process.env.MONGODB_URI as string,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as MongoClientOptions
)

async function connect() {
  //   if (!client.isConnected()) await client.connect()
  await client.connect()

  const db = client.db("gtd")
  return { db, client }
}

export { connect }
