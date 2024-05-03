import { MongoClient } from "mongodb";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
import {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Define types for clarity and type safety
interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  contentEmbedding: number[];
}

// Function to find similar documents using Mongoose with types
async function findSimilarDocuments(
  embedding: number[],
  userId: string,
): Promise<Note[]> {
  const url = process.env.MONGODB_URI || "mongodb://localhost:27017";
  const client = new MongoClient(url);
  try {
    await client.connect();
    const db = client.db("nextnotes-database"); // Replace with your database name
    const collection = db.collection<Note>("notes"); // Replace with your collection name

    // Create a vector index if it doesn't exist
    await collection.createIndex(
      { contentEmbedding: "text" },
      { name: "notes_index" },
    );

    const documents = await collection
      .aggregate([
        {
          $vectorSearch: {
            queryVector: embedding,
            path: "contentEmbedding",
            numCandidates: 50,
            limit: 5,
            index: "notes_index",
          },
        },
      ])
      .toArray();

    const notes: Note[] = documents.map((doc) => ({
      id: doc._id.toString(), // Convert ObjectId to string
      title: doc.title,
      content: doc.content,
      userId: doc.userId,
      contentEmbedding: doc.contentEmbedding,
    }));

    return notes.filter((doc) => doc.userId === userId);
  } finally {
    await client.close();
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;
    const messagesTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join("\n"),
    );

    const { userId } = auth();

    if (!userId) {
      throw new Error("Authentication failed: userId is null");
    }

    const relevantNotes = await findSimilarDocuments(embedding, userId);

    const systemMessage: ChatCompletionMessageParam = {
      role: "system",
      content:
        "You are an intelligent note-taking assistant. You can answer any question about users' notes. If you don't know the answer, say that you don't know. Do not make up an answer." +
        "The relevant notes for this query are: \n" +
        relevantNotes
          .map((note) => `Title: ${note.title}\n\nContent: \n${note.content}`)
          .join("\n\n"),
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [...messagesTruncated, systemMessage],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
