require('dotenv').config();
const path = require("path");
const mongoose = require('mongoose');

const bodyParser = require("body-parser");
const User = require("./models/user");
const errorController = require("./controllers/error");
const flash = require('connect-flash');

const express = require("express");
const session = require('express-session');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const { doubleCsrf } = require('csrf-csrf');

const MongoDbStore = require('connect-mongodb-session')(session);

const app = express();
const MongoUri = process.env.MONGODB_URI;
const store = new MongoDbStore({
  uri: MongoUri,
  collection: 'sessions'
});
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

// csrf-csrf setup
const {doubleCsrfProtection} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  getSessionIdentifier: (req) => req.session.id || "",
  cookieName: "x-csrf-token",
  cookieOptions: {
    sameSite: "strict",
    secure: false, // set to true in production (HTTPS)
    signed: false,
    httpOnly: false,
  },
  getCsrfTokenFromRequest: (req) => req.body._csrf || req.headers['csrf-token'],
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");


app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({
  storage: fileStorage, 
  fileFilter: fileFilter
}).single('image'));
app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
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
app.use(flash());
app.use(doubleCsrfProtection);
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)
app.use(errorController.get404);

mongoose.connect(MongoUri)
  .then(() => {
    console.log("Connected to database");
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running on port ${process.env.PORT || 4000}`);
    });
  })
  .catch(err => {
    console.log(err);
  });