import {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLScalarType,
} from "graphql";
import {
  AuthorModel,
  FolderModel,
  NoteModel,
  NotificationModel,
  BoardModel,
  TaskModel,
} from "../models/index.js";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

const Data = new GraphQLInputObjectType({
  name: "Data",
  fields: {
    name: { type: String },
    description: { type: String },
    status: { type: String },
  },
});

export const resolvers = {
  Date: new GraphQLScalarType({
    name: "Date",
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.toISOString();
    },
  }),

  Query: {
    folders: async (parent, args, context) => {
      const folders = await FolderModel.find({
        authorId: context.uid,
      }).sort({
        updatedAt: "desc",
      });
      console.log({ folders, context });
      return folders;
    },
    folder: async (parent, args) => {
      const folderId = args.folderId;
      console.log({ folderId });
      const foundFolder = await FolderModel.findById(folderId);
      return foundFolder;
    },
    //get list
    boards: async (parent, args, context) => {
      console.log("[Query] boards >>:");
      console.log(parent, args, context);
      const boards = await BoardModel.find({
        authorId: context.uid,
      }).sort({
        updatedAt: "desc",
      });
      return boards;
    },
    //get board item
    // parent
    // arg => client gửi lên
    board: async (parent, args, context) => {
      console.log("[Query] boards >>:");
      console.log(parent, args, context);
      const { folderId } = args;
      const foundBoard = await BoardModel.findById(folderId);
      return foundBoard;
    },
    note: async (parent, args) => {
      const noteId = args.noteId;
      const note = await NoteModel.findById(noteId);
      return note;
      // return fakeData.notes.find((note) => note.id === noteId);
    },
  },

  Folder: {
    author: async (parent, args) => {
      const authorId = parent.authorId;
      const author = await AuthorModel.findOne({
        uid: authorId,
      });
      return author;
    },
    notes: async (parent, args) => {
      console.log({ parent });
      const notes = await NoteModel.find({
        folderId: parent.id,
      }).sort({
        updatedAt: "desc",
      });
      console.log({ notes });
      return notes;
      // return fakeData.notes.filter((note) => note.folderId === parent.id);
    },
  },

  Board: {
    folders: async (parent, args) => {
      console.log({ parent });
      //6476ceffc107ec2d7b286e37
      console.log("object :>> ", args);

      const folders = await NoteModel.find({
        folderId: parent.id,
      }).sort({
        updatedAt: "desc",
      });
      return folders;
    },

    notes: async (parent, args) => {
      console.log("args");
      const notes = await NoteModel.find({
        folderId: parent.id,
      }).sort({
        updatedAt: "desc",
      });

      return notes;
    },
    tasks: async (parent, args) => {
      const tasks = await TaskModel.find({
        folderId: parent.id,
      }).sort({
        updatedAt: "desc",
      });

      const result = {
        TODO: [],
        INPROGRESS: [],
        DONE: [],
        RESOLVED: [],
        RELEASED: [],
      };

      tasks.forEach((item) => {
        result[`${item?.content?.status}`]?.push(item);
      });
      console.log("result :>> ", result);
      return result;
    },
  },

  Mutation: {
    addNote: async (parent, args) => {
      //  {folderId, content}  = args
      //
      console.log("[Mutation] Add note>>");
      console.log("args", args);
      const newNote = new NoteModel(args);
      await newNote.save();
      return newNote;
    },
    addTask: async (parent, args) => {
      // ##
      console.log("[Mutation] Add Task:>>");
      console.log("args", args);
      const newNote = new TaskModel(args);
      await newNote.save();
      return newNote;
    },

    updateNote: async (parent, args) => {
      const noteId = args.id;
      const note = await NoteModel.findByIdAndUpdate(noteId, args);
      return note;
    },
    addBoard: async (parent, args, context) => {
      //
      console.log(args, context);
      console.log("[Mutation] add new board >>:");
      const newBoard = new BoardModel({
        ...args,
        authorId: context.uid,
      });
      pubsub.publish("FOLDER_CREATED", {
        folderCreated: {
          message: "A new folder created",
        },
      });
      await newBoard.save();
      return newBoard;
    },
    deleteBoard: async (parent, args) => {
      console.log(" deleteBoard board :>> ", args.id);
      BoardModel.findOneAndDelete({
        _id: args.id,
      })
        .then((res) => ({
          success: true,
          message: "Deleted successfully",
        }))
        .catch((err) => ({
          success: false,
          message: JSON.stringify(err),
        }));
    },
    updateBoard: async (parent, args) => {
      const id = args.id;
      console.log("args :>> ", args);
      const board = await BoardModel.findByIdAndUpdate(id, args.content);
      return board;
    },

    updateTask: async (parent, args) => {
      // ##
      console.log("[Mutation] Update Task:>>");
      const taskId = args.id;
      const new_content = args.content;
      console.log("new_content", new_content);

      const foundTask = await TaskModel.findById({ _id: taskId });
      if (foundTask) {
        for (const [key, value] of Object.entries(new_content)) {
          console.log(key, value);
          foundTask.content[key] = value;
        }
      }

      console.log("foundTask :>> ", foundTask);
      await TaskModel.findByIdAndUpdate({ _id: taskId }, foundTask);
      return foundTask;
    },
    addFolder: async (parent, args, context) => {
      const newFolder = new FolderModel({ ...args, authorId: context.uid });
      console.log({ newFolder });
      pubsub.publish("FOLDER_CREATED", {
        folderCreated: {
          message: "A new folder created",
        },
      });
      await newFolder.save();
      return newFolder;
    },

    register: async (parent, args) => {
      const foundUser = await AuthorModel.findOne({ uid: args.uid });
      console.log("args :>> ", args);
      if (!foundUser) {
        const newUser = new AuthorModel(args);
        await newUser.save();
        return newUser;
      }

      return foundUser;
    },

    pushNotification: async (parent, args) => {
      const newNotification = new NotificationModel(args);

      pubsub.publish("PUSH_NOTIFICATION", {
        notification: {
          message: args.content,
        },
      });

      await newNotification.save();
      return { message: "SUCCESS" };
    },
  },

  Subscription: {
    folderCreated: {
      subscribe: () => pubsub.asyncIterator(["FOLDER_CREATED", "NOTE_CREATED"]),
    },
    notification: {
      subscribe: () => pubsub.asyncIterator(["PUSH_NOTIFICATION"]),
    },
  },
};
