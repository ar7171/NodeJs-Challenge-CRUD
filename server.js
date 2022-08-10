if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");

initializePassport(passport, (email) =>
  users.find((user) => user.email === email)
);

const users = [];
async function startServer() {
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(flash());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.get("/login", (req, res) => {
    app.set("view-engine", "ejs");
    res.render("login.ejs");
  });
  app.get("/register", (req, res) => {
    app.set("view-engine", "ejs");
    res.render("register.ejs");
  });

  app.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );

  app.post("/register", async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      users.push({
        //just for example
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });
      res.redirect("/login");
    } catch {
      res.redirect("/register");
    }
    console.log(users);
  });

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  //this can be deleted but highly recomended
  await apolloServer.start();

  apolloServer.applyMiddleware({ app: app, path: "/Ayazi" });

  app.use((req, res) => {
    app.set("view-engine", "ejs");
    res.render("index.ejs", { name: "Arman Ayazi" });
  });

  // app.get("/", (req, res) => {
  //   res.render("index.ejs");
  // });
  await mongoose.connect("mongodb://localhost:27017/post_db", {
    // ?????
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log("Mongoose connected ... ");
  app.listen(4000, () => console.log("Server are runnig on port 4000"));
}
startServer();
