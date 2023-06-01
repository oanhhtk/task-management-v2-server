import mongoose from "mongoose";

var Data = {
  name: String,
  descriptions: String,
  status: String,
};

const taskModel = new mongoose.Schema(
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

const NoteModel = mongoose.model("Task", taskModel);
export default NoteModel;
