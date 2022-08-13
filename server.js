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
const methodOverride = require("method-override");
const redis = require("redis");
const connectRedis = require("connect-redis")(session);
let RedisStore = require("connect-redis")(session);
const redisClient = redis.createClient({ host: "192.168.45.130", port: 6379 });

initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

//instead of user database
const users = [];

async function startServer() {
  const app = express();

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });
  //this can be deleted but highly recomended
  await apolloServer.start();

  apolloServer.applyMiddleware({ app: app, path: "/Ayazi" });

  await mongoose.connect("mongodb://localhost:27017/post_db", {
    // ?????
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log("Mongoose connected ... ");

  //------------------------------USER
  app.use(express.urlencoded({ extended: false }));
  app.use(flash());
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(methodOverride("_method"));

  app.get("/login", checkNotAuthenticated, (req, res) => {
    app.set("view-engine", "ejs");
    res.render("login.ejs");
  });

  app.post(
    "/login",
    checkNotAuthenticated,
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login",
      failureFlash: true,
    })
  );

  app.get("/register", checkNotAuthenticated, (req, res) => {
    app.set("view-engine", "ejs");
    res.render("register.ejs");
  });

  app.post("/register", checkNotAuthenticated, async (req, res) => {
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

  app.use(checkAuthenticated, (req, res) => {
    app.set("view-engine", "ejs");
    res.render("index.ejs", { name: req.user.name });
  });

  app.delete("/logout", (req, res) => {
    req.logOut();
    res.redirect("/login");
  });

  app.listen(4000, () => console.log("Server are runnig on port 4000"));
}

//its a middleware function
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}
startServer();
