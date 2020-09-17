const { db } = require('../util/admin');

exports.getAllCartCards = (req,res) => {
    db.collection('cartCards')
        .where('handle', '==', req.params.handle)
        .get().then(data => {
        let cartCards = [];
        data.forEach(doc => {
            cartCards.push({
                cartCardId: doc.id,
                cardId: doc.data().cardId,
                photoURL: doc.data().photoURL,
                title: doc.data().title,
                price: doc.data().price,
                count: doc.data().count
            })
        });
        return res.status(200).json(cartCards)
    }).catch(err => {
        console.log('error', err)
        return res.status(500).json({error: 'Something went wrong'})
    })
}

exports.addCartCard = (req,res) => {
    const handle = `${req.body.firstName}_${req.body.lastName}`
    const newCartCard = {
        cardId: req.body.cardId,
        photoURL: req.body.photoURL,
        handle,
        title: req.body.title,
        price: req.body.price,
        count: req.body.count
    }
        db.collection('cartCards')
            .add(newCartCard)
            .then((doc) => {
                const resCartCard = newCartCard;
                resCartCard.cartCardId = doc.id;
                res.json(resCartCard);
            })
        .catch((err) => {
            res.status(500).json({ error: err.code });
            console.error(err);
        });
}

exports.deleteCartCard = (req,res) => {
    const document = db.doc(`/cartCards/${req.params.cartCardId}`);
        document
            .get()
            .then((doc) => {
                if (!doc.exists) {
                    return res.status(400).json({ error: 'card not found' });
                }
                return document.delete();
            })
            .then(() => {
                res.status(200).json({ message: 'card deleted successfully' });
            })
        .catch((err) => {
            return res.status(500).json({ error: err.code });
        });
}

exports.increaseCount = (req,res) => {
    db.doc(`/cartCards/${req.params.cartCardId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(400).json({ error: 'Card not found' });
            }
            doc.ref.update({ count: doc.data().count + 1 });
        })
        .then(() => {
            res.status(200).json({ message: 'Card updated successfully' });
        })
        .catch((err) => {
            return res.status(500).json({ error: err.code });
        });
}

exports.decreaseCount = (req,res) => {
    db.doc(`/cartCards/${req.params.cartCardId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(400).json({ error: 'Card not found' });
            }
            return doc.ref.update({ count: doc.data().count - 1 });
        })
        .then(() => {
            res.status(200).json({ message: 'Card updated successfully' });
        })
        .catch((err) => {
            return res.status(500).json({ error: err.code });
        });
}