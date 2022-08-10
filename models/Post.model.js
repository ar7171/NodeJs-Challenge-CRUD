const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
  },
});
//its automatically plurizid
const Post = mongoose.model("post", PostSchema);
module.exports = Post;
