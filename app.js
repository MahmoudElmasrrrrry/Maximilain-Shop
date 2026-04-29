const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const errorController = require("./controllers/error");
const mongoose = require('mongoose');
const Product = require("./models/product");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  User.findById("69f2346f414aac7d7d7e37ae")
    .then(user => {
      req.user = user;
      next();
    }).catch(err => {
      console.log(err);
    });
})

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
mongoose.connect('mongodb://localhost:27017/shop')
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




