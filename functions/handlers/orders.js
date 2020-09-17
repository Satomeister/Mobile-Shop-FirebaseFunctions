const { db } = require('../util/admin');

exports.getAllOrders = (req,res) => {
    db.collection('orders').get().then(data => {
        let orders = [];
        data.forEach(doc => {
            orders.push({
                orderId: doc.id,
                createdAt: doc.data().createdAt,
                firstName: doc.data().firstName,
                lastName: doc.data().lastName,
                phoneNumber: doc.data().phoneNumber,
                cardsDataArr: doc.data().cardsDataArr,
                totalPrice: doc.data().totalPrice,
            })
        });
        return res.status(200).json(orders)
    }).catch(err => {
        console.log('error', err)
        return res.status(500).json({error: 'Something went wrong'})
    })
}

exports.addOrder = (req,res) => {
    const newOrder = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        cardsDataArr: req.body.cardsDataArr,
        totalPrice: req.body.totalPrice,
        createdAt: new Date().toISOString()
    };

    db.collection('orders')
        .add(newOrder)
        .then((doc) => {
            const resOrder = newOrder;
            resOrder.cardId = doc.id;
            res.json(resOrder);
        })
        .catch((err) => {
            res.status(500).json({ error: err.code });
            console.error(err);
        });
}

exports.deleteOrder = (req,res) => {
    const document = db.doc(`/orders/${req.params.orderId}`);
    document
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(400).json({ error: 'Order not found' });
            }
            return document.delete();
        })
        .then(() => {
            res.status(200).json({ message: 'Order deleted successfully' });
        })
        .catch((err) => {
            return res.status(500).json({ error: err.code });
        });
}