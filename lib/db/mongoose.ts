import mongoose, { Schema } from "mongoose";

mongoose.connect(process.env.MONGODB_URI!);
mongoose.Promise = global.Promise;

const noteSchema = new Schema(
  {
    title: String,
    content: String,
    userId: String,
    createdAt: Date,
    updateAt: Date,
  },
  {
    timestamps: true,
  },
);

export interface NoteDocument extends mongoose.Document {
  title: string;
  content?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const Note =
  mongoose.models.Note || mongoose.model<NoteDocument>("Note", noteSchema);
export default Note;
export type { NoteDocument as noteSchema };
