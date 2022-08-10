const { gql } = require("apollo-server-express");
const typeDefs = gql`
  type Post {
    id: ID
    title: String
    description: String
  }
  type Query {
    hello: String

    getAllPosts: [Post]

    getPost(id: ID): Post
  }
  # //این تایپ چیه ؟؟؟؟
  input PostInput {
    title: String
    description: String
  }

  type Mutation {
    createPost(post: PostInput): Post
    # اگه بخواد کنسول یا آلرت برگردونه چی ؟؟؟
    deletePost(id: ID): String

    updatePost(id: ID, post: PostInput): Post
  }
`;

module.exports = typeDefs;
