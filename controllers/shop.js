const Product = require("../models/product");
const User = require("../models/user");
const Order = require('../models/order')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const itemsPerPage = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then(num => {
      totalItems = num;
      return Product.find().skip((page - 1) * itemsPerPage).limit(itemsPerPage);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        totalProducts: totalItems,
        currentPage: page,
        hasNextPage: itemsPerPage * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / itemsPerPage),
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
        path: "/products"
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then(num => {
      totalItems = num;
      return Product.find().skip((page - 1) * itemsPerPage).limit(itemsPerPage);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        totalProducts: totalItems,
        currentPage: page,
        hasNextPage: itemsPerPage * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / itemsPerPage),
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: user.cart.items
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
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  }).then(result => {
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
  return req.user.populate('cart.items.productId').then(user => {
    const product = user.cart.items.map(c => {
      return { quantity: c.quantity, product: { ...c.productId._doc } }
    });
    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      products: product
    })
    return order.save();
  })
    .then(result => {
      return req.user.clearCart();
    })
    .then(result => {
      return res.redirect('/orders');
    }).catch(err => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders
      })
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout"
  });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return res.render('shop/orders', {
          path: "/orders",
          pageTitle: "Your Orders",
          orders: []
        });
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return res.render('shop/orders', {
          path: "/orders",
          pageTitle: "Your Orders",
          orders: []
        });
      }
      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
      
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.product.price * prod.quantity;
      });

      const pdfDoc = new PDFDocument({ size: 'A4', margin: 50 });
      // Stream to both file system (cache) and response
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      // --- Top Accent Accent Bar ---
      pdfDoc.rect(0, 0, 595.28, 15).fill('#1e293b'); // Dark Navy Slate accent bar at the very top

      // --- Header Branding ---
      pdfDoc.fillColor('#1e293b')
            .font('Helvetica-Bold')
            .fontSize(22)
            .text('NODE E-SHOP', 50, 40);

      pdfDoc.fontSize(9)
            .font('Helvetica')
            .fillColor('#64748b')
            .text('Your ultimate coding bookstore & shop', 50, 65);

      pdfDoc.font('Helvetica-Bold')
            .fontSize(24)
            .fillColor('#3b82f6')
            .text('INVOICE', 350, 38, { align: 'right', width: 195 });

      // --- Metadata Details (Invoice # and Date) ---
      pdfDoc.font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('#1e293b')
            .text('Invoice Details', 350, 75, { align: 'right', width: 195 });

      pdfDoc.font('Helvetica')
            .fillColor('#64748b')
            .text(`Invoice No: #${order._id.toString().substring(0, 8)}...`, 350, 88, { align: 'right', width: 195 })
            .text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 350, 100, { align: 'right', width: 195 });

      // --- Divider ---
      pdfDoc.moveTo(50, 125)
            .lineTo(545.28, 125)
            .strokeColor('#cbd5e1')
            .lineWidth(1)
            .stroke();

      // --- Billing Details Grid ---
      pdfDoc.font('Helvetica-Bold')
            .fontSize(10)
            .fillColor('#1e293b')
            .text('BILL TO', 50, 145)
            .text('BILLED BY', 300, 145);

      pdfDoc.font('Helvetica')
            .fontSize(9)
            .fillColor('#475569')
            // Left Column (Bill To)
            .text(`Name: ${order.user.name}`, 50, 160, { width: 220 })
            .text(`Email: ${req.user.email}`, 50, 172, { width: 220 })
            // Right Column (Billed By)
            .text('Node E-Shop Inc.', 300, 160, { width: 245 })
            .text('123 Developer Way', 300, 172, { width: 245 })
            .text('Tech City, TC 10101', 300, 184, { width: 245 })
            .text('support@nodeshop.com', 300, 196, { width: 245 });

      // --- Divider ---
      pdfDoc.moveTo(50, 220)
            .lineTo(545.28, 220)
            .strokeColor('#cbd5e1')
            .lineWidth(1)
            .stroke();

      // --- Items Table Headers ---
      const tableTop = 240;
      pdfDoc.rect(50, tableTop, 495.28, 24).fill('#f8fafc');

      pdfDoc.font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('#1e293b')
            .text('Item Description', 60, tableTop + 8, { width: 240, align: 'left' })
            .text('Unit Price', 310, tableTop + 8, { width: 70, align: 'right' })
            .text('Qty', 390, tableTop + 8, { width: 40, align: 'right' })
            .text('Total Price', 450, tableTop + 8, { width: 85, align: 'right' });

      // Draw bottom line under headers
      pdfDoc.moveTo(50, tableTop + 24)
            .lineTo(545.28, tableTop + 24)
            .strokeColor('#cbd5e1')
            .lineWidth(1)
            .stroke();

      // --- Table Rows ---
      let y = tableTop + 24;
      order.products.forEach((prod, index) => {
        const item = prod.product;
        const qty = prod.quantity;
        const price = item.price;
        const total = price * qty;

        // Alternating row background for clean styling
        if (index % 2 === 1) {
          pdfDoc.rect(50, y, 495.28, 24).fill('#f8fafc');
        }

        pdfDoc.font('Helvetica')
              .fontSize(9)
              .fillColor('#334155')
              .text(item.title, 60, y + 8, { width: 240, align: 'left', lineBreak: false })
              .text(`$${price.toFixed(2)}`, 310, y + 8, { width: 70, align: 'right' })
              .text(qty.toString(), 390, y + 8, { width: 40, align: 'right' })
              .text(`$${total.toFixed(2)}`, 450, y + 8, { width: 85, align: 'right' });

        // Draw row divider
        pdfDoc.moveTo(50, y + 24)
              .lineTo(545.28, y + 24)
              .strokeColor('#f1f5f9')
              .lineWidth(0.5)
              .stroke();

        y += 24;
      });

      // --- Summary / Totals ---
      y += 15;
      const subtotal = totalPrice;
      const tax = subtotal * 0.1; // 10% tax
      const shipping = 0; // FREE
      const grandTotal = subtotal + tax + shipping;

      // Right align block starting at x = 320
      pdfDoc.font('Helvetica')
            .fontSize(9)
            .fillColor('#64748b')
            .text('Subtotal:', 320, y, { width: 100, align: 'right' })
            .text(`$${subtotal.toFixed(2)}`, 430, y, { width: 105, align: 'right' });

      y += 15;
      pdfDoc.text('VAT (10%):', 320, y, { width: 100, align: 'right' })
            .text(`$${tax.toFixed(2)}`, 430, y, { width: 105, align: 'right' });

      y += 15;
      pdfDoc.text('Shipping:', 320, y, { width: 100, align: 'right' })
            .text('FREE', 430, y, { width: 105, align: 'right' });

      y += 18;
      // Grand Total Highlight Banner
      pdfDoc.rect(320, y - 5, 225.28, 26).fill('#1e293b');

      pdfDoc.font('Helvetica-Bold')
            .fontSize(10)
            .fillColor('#ffffff')
            .text('Grand Total:', 330, y + 3, { width: 90, align: 'left' })
            .text(`$${grandTotal.toFixed(2)}`, 430, y + 3, { width: 105, align: 'right' });

      // --- Footer ---
      const footerY = 720;
      pdfDoc.moveTo(50, footerY)
            .lineTo(545.28, footerY)
            .strokeColor('#cbd5e1')
            .lineWidth(0.5)
            .stroke();

      pdfDoc.font('Helvetica-Oblique')
            .fontSize(8)
            .fillColor('#94a3b8')
            .text('Thank you for your business!', 50, footerY + 15, { align: 'center', width: 495.28 });

      pdfDoc.font('Helvetica')
            .fontSize(8)
            .text('If you have any questions about this invoice, please contact support@nodeshop.com', 50, footerY + 28, { align: 'center', width: 495.28 });

      pdfDoc.end();
    })
    .catch(err => console.log(err));
};
