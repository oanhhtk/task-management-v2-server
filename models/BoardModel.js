import mongoose from "mongoose";

const boardModel = new mongoose.Schema(
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

const BoardModel = mongoose.model("Board", boardModel);
export default BoardModel;
