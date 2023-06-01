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
      // return fakeData.notes.filter((note) => note.folderId === parent.id);
    },
    tasks: async (parent, args) => {
      console.log("args");
      const tasks = await TaskModel.find({
        folderId: parent.id,
      }).sort({
        updatedAt: "desc",
      });

      const result = {
        TODO: [],
        INPROGRESS: [],
        DONE: [],
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
      //  {folderId, content}  = args
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
      console.log("[Mutation] add new board >>:");
      const newBoard = new BoardModel({ ...args, authorId: context.uid });
      pubsub.publish("FOLDER_CREATED", {
        folderCreated: {
          message: "A new folder created",
        },
      });
      await newBoard.save();
      return newBoard;
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
