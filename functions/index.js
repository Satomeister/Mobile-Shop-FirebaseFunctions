const functions = require('firebase-functions');

const express = require('express')
const app = express();

const cors = require('cors');
app.use(cors());

const { getCardsLength, getAllCards, uploadExtraCards, getAllBrands, getCardsByBrand, getCardById, addNewCard} = require('./handlers/cards')
const { getAllOrders, addOrder, deleteOrder } = require('./handlers/orders')
const { getAllCartCards, addCartCard, deleteCartCard, increaseCount, decreaseCount } = require('./handlers/cart')
const { addComment, deleteComment } = require('./handlers/comments')
const { login, signup, getUserData, logout} = require('./handlers/users')

//cards
app.get('/cards/:size/:brand', getCardsLength)
app.get('/cards', getAllCards)
app.get('/card/:size/:brand',uploadExtraCards)
app.get('/brands', getAllBrands)
app.get('/brand/:brand', getCardsByBrand)
app.get('/card/:cardId', getCardById)
app.post('/card', addNewCard)

//orders
app.get('/orders', getAllOrders)
app.post('/order', addOrder)
app.delete('/order/:orderId', deleteOrder)

//comments
app.post('/comment', addComment)
app.delete('/comment/:commentId/:cardId', deleteComment)

//cart
app.get('/cart/:handle', getAllCartCards)
app.post('/cart', addCartCard)
app.delete('/cart/:cartCardId/:cardId', deleteCartCard)
app.get('/inc/:cartCardId', increaseCount)
app.get('/dec/:cartCardId', decreaseCount)

//auth
app.post('/signup',signup)
app.post('/login', login)
app.get('/user/:token',getUserData)
app.get('/logout', logout)

exports.api = functions.https.onRequest(app)