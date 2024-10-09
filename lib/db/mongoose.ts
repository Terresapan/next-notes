import mongoose, { Document, Schema } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: { cache?: MongooseCache };
}

let cached = global.mongoose?.cache || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = { cache: cached };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export interface NoteDocument extends Document {
  title: string;
  content?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema: Schema = new mongoose.Schema(
  {
    title: String,
    content: String,
    userId: String,
    createdAt: Date,
    updatedAt: Date,
    contentEmbedding: [Number],
  },
  {
    timestamps: true,
  },
);

const Note =
  mongoose.models.Note || mongoose.model<NoteDocument>("Note", noteSchema);

export default Note;
export { connectDB };
export type { NoteDocument as noteSchema };
