const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const mongoose = require("mongoose");

async function startServer() {
  const app = express();
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  //this can be deleted but highly recomended
  await apolloServer.start();

  apolloServer.applyMiddleware({ app: app, path: "/Ayazi" });

  app.use((req, res) => {
    res.send("hello from express apollo server");
  });

  await mongoose.connect("mongodb://localhost:27017/post_db", {
    // ?????
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log("Mongoose connected ... ");
  app.listen(4000, () => console.log("Server are runnig on port 4000"));
}
startServer();
