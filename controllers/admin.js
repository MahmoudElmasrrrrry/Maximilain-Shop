const { validationResult } = require("express-validator");
const Product = require("../models/product");
const fileHelper = require('../util/file')

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: null,
    validationErrors: [],
    oldContent: {
      title: '',
      imageUrl: '',
      price: '',
      description: ''
    }
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (image) {
      fileHelper(image.path);
    }
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      validationErrors: errors.array(),
      errorMessage: errors.array()[0].msg,
      oldContent:{
        title: title,
        imageUrl: '',
        price: price,
        description: description
      }
    });
  }
  if(!image){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      isAuthenticated: req.session.isLoggedIn,
      validationErrors: [],
      errorMessage: 'Please provide a valid image (png, jpg, jpeg)',
      oldContent: {
        title: title,
        imageUrl: '',
        price: price,
        description: description
      }
    });
  }
  const imageUrl = image.path;
  const product = new Product({ title: title, price: price, imageUrl: imageUrl, description: description, userId: req.user });
  product.save()
    .then(() => {
      console.log("Product Created");
      res.redirect("/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId).then((product) => {
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: null,
      validationErrors: [],
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, description } = req.body;
  const image = req.file;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product: { _id: productId, title, price, description },
      isAuthenticated: req.session.isLoggedIn,
      validationErrors: errors.array(),
      errorMessage: errors.array()[0].msg,
    });
  }
  Product.findById(productId)
    .then(product => {
      let imageUrl = product.imageUrl;
      if (image) {
        fileHelper(product.imageUrl);
        imageUrl = image.path;
      }
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      return product.save();
    })
    .then(() => {
      console.log("Product Updated");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    // .select('title imageUrl price')
    // .populate('userId')
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(prod => {
    if(!prod){
      throw new Error('Product not found')
    }
    fileHelper(prod.imageUrl)
    return Product.deleteOne({_id: prodId, userId: req.user._id})
  }).then(() => {
      console.log("Product Deleted");
      res.status(200).json({message: 'Success!'})
    })
    .catch((err) => {
      res.status(500).json({message: 'Failed to delete product!'})
    });
};
