const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const lodash = require("lodash");
const mongoose = require("mongoose");

let isBig = false;

mongoose.connect("mongodb://127.0.0.1:27017/blogPostDB").then(() => {
  console.log("Connected");
});

const blogeSchema = new mongoose.Schema({
  title: String,
  body: String,
});

const smallBlogeSchema = new mongoose.Schema({
  title: String,
  body: String,
  isBig: Boolean,
});

const Bloge = new mongoose.model("bloges", blogeSchema);

const smallBloge = new mongoose.model("smallBloges", smallBlogeSchema);

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";

const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";

const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const posts = [
  {
    title: "Hello",
    content:
      "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.",
    isBig: false,
  },
];

const smallPost = lodash.cloneDeep(posts);

// const truncateContent = (allPost, length) => {
//   const contentLrgth = allPost.content.length;
//   if (contentLrgth > length) {
//     allPost.content = allPost.content.substring(0, length) + "...";
//     allPost.isBig = true;
//     console.log(allPost.isBig);
//   }
// };

const truncateContent = (post, length) => {
  const contentLrgth = post.length;

  if (contentLrgth > length) {
    const content = post.substring(0, length) + "...";
    isBig = true;
    return content;
  } else {
    return post;
  }
};

// ------------------------------------------------ / ----------------------------------------------------

app.get("/", (req, res) => {
  // smallPost.forEach((ele) => {
  //   truncateContent(ele, 100);
  // });

  smallBloge.find({}).then((data, err) => {
    console.log(data);
    res.render("home", {
      homeContent: homeStartingContent,
      allPost: data,
    });
  });

  // truncated = false;
});

// --------------------------------------------------- /about---------------------------------------------

app.get("/about", (req, res) => {
  res.render("about", { aboutContent: aboutContent });
});

// --------------------------------------------------- /contact ----------------------------------------------

app.get("/contact", (req, res) => {
  res.render("contact", { contactContent: contactContent });
});

// --------------------------------------------------- /compose ----------------------------------------------

app.get("/compose", (req, res) => {
  res.render("compose");
});

// ---------------------------------------------------    /post:title   --------------------------------------

app.get("/post/:title", (req, res) => {
  // const onePost = smallBloge.find((ele) => {
  //   return lodash.lowerCase(ele.title) === lodash.lowerCase(req.params.title);
  // });

  Bloge.find({ title: lodash.lowerCase(req.params.title) }).then(
    (data, err) => {
      if (data) {
        console.log(data)
        res.render("post", {
          onePostTitle: data[0]?.title,
          onePostContent: data[0]?.body,
        });
      } else {
        res.render("post", {
          onePostTitle: "No such post avilable",
          onePostContent: "Please add your post",
        });
        console.log(err);
      }
    }
  );
});

// ---------------------------------------------- /post/compose --------------------------------------

app.post("/compose", (req, res) => {

  const bloge = new Bloge({
    title: req.body.textHeading,
    body: req.body.textBody,
  });

  bloge.save().then((data, err) => {
    err ? console.log(err) : console.log("Saved");
  });

  const smallbloge = new smallBloge({
    title: req.body.textHeading,
    body: truncateContent(req.body.textBody, 100),
    isBig: isBig,
  });

  isBig = false;

  smallbloge.save().then((data, err) => {
    err ? console.log(err) : console.log("Saved") 
  });
  // posts.push(post);
  res.redirect("/");
});

// --------------------------------------    listen     ------------------------------------------------

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
