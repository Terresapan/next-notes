import mongoose from "mongoose";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
import {
  ChatCompletionMessage,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";
import { OpenAIStream, StreamingTextResponse } from "ai";
import Note, { NoteDocument, connectDB } from "@/lib/db/mongoose";

// Function to find similar documents using Mongoose with types
async function findSimilarDocuments(
  embedding: number[],
  userId: string,
): Promise<NoteDocument[]> {
  try {
    await connectDB();

    // First, try vector search
    const vectorSearchAgg = [
      {
        $vectorSearch: {
          index: "notes_index",
          path: "contentEmbedding",
          queryVector: embedding,
          numCandidates: 50,
          limit: 5,
        },
      },
      {
        $match: {
          userId: userId,
        },
      },
    ];

    let documents = await Note.aggregate(vectorSearchAgg);

    // If vector search returns no results, fall back to a regular text search
    if (documents.length === 0) {
      documents = await Note.find({ userId: userId }).limit(5).lean();
    }

    console.log(
      `Found ${documents.length} relevant documents for user ${userId}`,
    );
    return documents;
  } catch (error) {
    console.error("Error in findSimilarDocuments:", error);
    if (error instanceof mongoose.Error) {
      console.error("Mongoose error details:", error);
    }
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;
    const messagesTruncated = messages.slice(-6);
    const userQuery = messagesTruncated
      .map((message) => message.content)
      .join("\n");
    console.log("User query:", userQuery);

    const embedding = await getEmbedding(userQuery);
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const relevantNotes = await findSimilarDocuments(embedding, userId);
    console.log("Relevant notes:", JSON.stringify(relevantNotes, null, 2));

    const systemMessage: ChatCompletionMessageParam = {
      role: "system",
      content:
        "You are an intelligent note-taking assistant. Answer questions based on the user's notes. If the information isn't in the notes, say you don't know. Here are the relevant notes:\n\n" +
        relevantNotes
          .map((note) => `Note: ${note.title}\n${note.content}\n---`)
          .join("\n"),
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      stream: true,
      messages: [...messagesTruncated, systemMessage],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error in POST route:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
