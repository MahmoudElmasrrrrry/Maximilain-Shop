const path = require("path");
const mongoose = require('mongoose');
const express = require("express");
const bodyParser = require("body-parser");
const User = require("./models/user");
const errorController = require("./controllers/error");
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);

const app = express();
const MongoUri = 'mongodb://localhost:27017/shop'
const store = new MongoDbStore({
  uri: MongoUri,
  collection: 'sessions'
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret:"my secret key",
  resave:false,
  saveUninitialized:false,
  store:store
}));
app.use((req, res, next) => {
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
})
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)
app.use(errorController.get404);

mongoose.connect(MongoUri)
  .then(() => {
    User.findOne().then(user =>{
      if(!user){
        const user = new User({ name: "Masry", email: "masry@email.com", cart: { items:[] } });
        user.save();
      }
    })
    console.log("Connected to database");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch(err => {
    console.log(err);
  });