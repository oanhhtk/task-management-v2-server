import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    authorId: {
      type: String,
      required: true,
    },
  },
  {
    // auto generate createdAt, apdatedAt
    timestamps: true,
  }
);

const FolderModel = mongoose.model("Folder", folderSchema);
export default FolderModel;
