const mongodb = require('mongodb');
const { getDb } = require('../util/database');

class User {
    constructor(userName, email, cart, id) {
        this.name = userName;
        this.email = email;
        this.cart = cart
        this._id = id
    }

    save() {
        const db = getDb();
        const user = db.collection('users');
        return user.insertOne(this);
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(item => item.productId.toString() === product._id.toString());
        let newQuantity = 1;
        let updatedCartItems = [...this.cart.items];

        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({ productId: new mongodb.ObjectId(product._id), quantity: newQuantity });
        }

        const updatedCart = { items: updatedCartItems };
        const db = getDb();
        const user = db.collection('users');
        return user.updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: updatedCart } });
    }

    getCart() {
        const db = getDb();
        const products = db.collection('products');
        const productIds = this.cart.items.map(i => {
            return i.productId
        })
        return products.find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(product => {
                    return {
                        ...product,
                        quantity: this.cart.items.find(i => {
                            return i.productId.toString() === product._id.toString()
                        }).quantity
                    }
                })
            })
    }

    static findOne() {
        const db = getDb();
        const user = db.collection('users');
        return user.findOne({});
    }

    static findById(id) {
        const db = getDb();
        const user = db.collection('users');
        return user.findOne({ _id: new mongodb.ObjectId(id) })
            .then(user => {
                console.log(user);
                return user;
            }).catch(err => {
                console.log(err);
            });
    }

    deleteFromCart(prodId) {
        const db = getDb();
        const user = db.collection('users');
        const updateCart = this.cart.items.filter(item => item.productId.toString() !== prodId.toString());
        return user.updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: updateCart } } });
    }

    createOrder() {
        const db = getDb();
        const orders = db.collection('order')
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new mongodb.ObjectId(this._id),
                        name: this.name
                    }
                }
                return orders.insertOne(order)
            })
            .then(result => {
                this.cart = { items: [] };
                return db
                    .collection('users')
                    .updateOne(
                        { _id: new mongodb.ObjectId(this._id) },
                        { $set: { cart: { items: [] } } }
                    );
            });
    }

    getOrders() {
        const db = getDb();
        const order = db.collection('order')
        return order.find({ 'user._id': new mongodb.ObjectId(this._id) }).toArray()
    }
}

module.exports = User;