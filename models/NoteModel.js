import mongoose from "mongoose";

var Data = {
  name: String,
  descriptions: String,
  status: String,
};

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: Data,
    },
    folderId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const NoteModel = mongoose.model("Note", noteSchema);
export default NoteModel;
