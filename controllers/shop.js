const Product = require("../models/product");
const User = require("../models/user");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });
  // Cart.getCart(cart => {
  //   Product.findAll().then(products => {
  //     const cartProducts = [];
  //     for (product of products) {
  //       const cartProductData = cart.products.find(prod => prod.id === product.id);
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render('shop/cart', {
  //       path: '/cart',
  //       pageTitle: 'Your Cart',
  //       products: cartProducts
  //     });
  //   }).catch(err => {
  //     console.log(err);
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let newQuantity = 1;
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  }).then(result => {
    console.log(result);
    return res.redirect('/cart');
  }).catch(err => {
    console.log(err);
  });
  // let fetchedCart;
  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then((products) => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }
  //     if (product) {
  //       console.log(product);

  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }
  //     return Product.findByPk(prodId);
  //   })
  //   .then((product) => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity },
  //     });
  //   })
  //   .then(() => {
  //     res.redirect("/cart");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.deleteFromCart(prodId)
    .then(result => {
      return res.redirect('/cart');
    }).catch(err => {
      console.log(err);
    });
  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then((products) => {
  //     const product = products[0];
  //     return product.cartItem.destroy();
  //   })
  //   .then((result) => {
  //     res.redirect("/cart");
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
};

exports.postOrder = (req, res, next) => {
  req.user.createOrder()
    .then(result => {
      console.log(result);
      return res.redirect('/orders');
    }).catch(err => {
      console.log(err);
    });
};
exports.getOrders = (req, res, next) => {
  req.user.getOrders().then((orders) => {
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
    })
  })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
