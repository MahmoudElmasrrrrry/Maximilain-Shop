const {mongoConnect} = require('./util/database');
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const errorController = require("./controllers/error");

const Product = require("./models/product");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next)=>{
    User.findOne()
    .then(user=>{
        req.user = new User(user.name, user.email, user.cart, user._id);
        next();
    }).catch(err=>{
        console.log(err);
    });
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(()=>{
  User.findOne().then(user => {
    if(!user){
      const newUser = new User('TestUser', 'test@test.com', {items:[]});
      return newUser.save();
    }
  }).then(() => {
    app.listen(3000, () => {
      console.log("Server is running ...");
    });
  });
})