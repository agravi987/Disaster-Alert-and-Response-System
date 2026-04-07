import "server-only";
import { Collection } from "mongodb";
import { DEMO_ACCOUNTS, DemoAccount, UserRole } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

interface UserDocument {
  name: string;
  role: UserRole | "user";
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

let seedPromise: Promise<void> | null = null;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapUserDocumentToAccount(document: UserDocument): DemoAccount {
  const normalizedRole = document.role === "user" ? "citizen" : document.role;

  return {
    name: document.name,
    role: normalizedRole,
    email: document.email,
    password: document.password,
  };
}

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const database = await getDatabase();
  return database.collection<UserDocument>("users");
}

export async function ensureDemoUsers(): Promise<void> {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    const usersCollection = await getUsersCollection();
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    const now = new Date();

    // Migrate old role naming to citizen so prior seeded data remains usable.
    await usersCollection.updateMany(
      { role: "user" },
      {
        $set: {
          role: "citizen",
          updatedAt: now,
        },
      },
    );

    // Remove legacy coordinator demo account from previous project versions.
    const legacyCoordinatorEmail = normalizeEmail(
      process.env.COORDINATOR_EMAIL ?? "coordinator@rescue.local",
    );
    await usersCollection.deleteMany({ email: legacyCoordinatorEmail });

    for (const account of DEMO_ACCOUNTS) {
      const normalizedEmail = normalizeEmail(account.email);

      await usersCollection.updateOne(
        { email: normalizedEmail },
        {
          $set: {
            name: account.name,
            role: account.role,
            email: normalizedEmail,
            password: account.password.trim(),
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true },
      );
    }
  })();

  return seedPromise;
}

export async function getDemoUsers(): Promise<DemoAccount[]> {
  await ensureDemoUsers();
  const usersCollection = await getUsersCollection();
  const users = await usersCollection.find({}).toArray();
  return users.map(mapUserDocumentToAccount);
}

export async function findUserByCredentials(
  email: string,
  password: string,
): Promise<DemoAccount | null> {
  await ensureDemoUsers();
  const usersCollection = await getUsersCollection();

  const user = await usersCollection.findOne({
    email: normalizeEmail(email),
    password: password.trim(),
  });

  return user ? mapUserDocumentToAccount(user) : null;
}

export async function findUserByEmail(email: string): Promise<DemoAccount | null> {
  await ensureDemoUsers();
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email: normalizeEmail(email) });
  return user ? mapUserDocumentToAccount(user) : null;
}

export async function createUser(input: {
  name: string;
  role: UserRole;
  email: string;
  password: string;
}): Promise<DemoAccount> {
  await ensureDemoUsers();
  const usersCollection = await getUsersCollection();

  const normalizedEmail = normalizeEmail(input.email);
  const existing = await usersCollection.findOne({ email: normalizedEmail });

  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }

  const now = new Date();
  const document: UserDocument = {
    name: input.name.trim(),
    role: input.role,
    email: normalizedEmail,
    password: input.password.trim(),
    createdAt: now,
    updatedAt: now,
  };

  await usersCollection.insertOne(document);
  return mapUserDocumentToAccount(document);
}
