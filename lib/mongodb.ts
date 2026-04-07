import "server-only";
import { Db, MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const MONGODB_DB_NAME =
  process.env.MONGODB_DB_NAME ?? "disaster_alert_rescue";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const mongoClientPromise: Promise<MongoClient> =
  global._mongoClientPromise ??
  (() => {
    const client = new MongoClient(MONGODB_URI);
    const clientPromise = client.connect();
    global._mongoClientPromise = clientPromise;
    return clientPromise;
  })();

global._mongoClientPromise = mongoClientPromise;

export async function getDatabase(): Promise<Db> {
  const client = await mongoClientPromise;
  return client.db(MONGODB_DB_NAME);
}
