export const typeDefs = `#graphql
  scalar Date

  type Folder {
    id: String!,
    name: String,
    createdAt: String,
    author: Author,
    notes: [Note]
  }
  
  type Board {
    id: String!,
    name: String,
    createdAt: String,
    author: Author,
    administrators: String,
    board_type: String,
    descriptions: String,
    folders: [Note],
    notes: [Note],
    tasks: OutputTask,
  }

  type OutputTask {
    DONE:[Task]
    INPROGRESS: [Task]
    TODO: [Task]
    RESOLVED: [Task]
    RELEASED: [Task]
  }


  type ContentDataType {
    _id: String
    name: String,
    descriptions: String,
    status: String,
    issue_type: String,
    priority: String
  }

  type Note {
    id: String!,
    content: ContentDataType,
    updatedAt: Date
  }

  type Task {
    id: String!,
    content: ContentDataType,
    createdAt: Date
    updatedAt: Date
  }

  input TaskContentInput {
    name: String,
    descriptions: String,
    status: String,
    issue_type: String
    priority: String
  }

  type Author {
    uid: String!,
    name: String!,
    email: String!
  }

  input BoardInput {
    name: String!,
    administrators: String!,
    descriptions: String,
    board_type: String!
  }

  type Query {
    folders: [Folder],
    boards: [Board],
    notes: [Note],
    folder(folderId: String!): Folder,
    board(folderId: String!): Board,
    note(noteId: String): Note,
  }
  

  type Mutation {
    addFolder(name: String!): Folder,
    ##
    addBoard(name: String!,administrators: String!,descriptions: String,board_type: String!): Board,
    ##
    addNote(content: TaskContentInput, folderId: ID!): Note,
    updateNote(id: String!,content: String!): Note,
    ##
    addTask(content: TaskContentInput, folderId: ID!): Task,
    updateTask(id: String!,content: String!): Task,
    ##
    register(uid: String!, name: String!, email: String!): Author
    pushNotification(content: String): Message
  }

  type Message {
    message: String
  }

  type Subscription {
    folderCreated: Message
    notification: Message
  }
`;
