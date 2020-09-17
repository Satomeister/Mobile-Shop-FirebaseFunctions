const { db } = require('../util/admin');

exports.getAllCards = (req,res) => {
    db.collection('cards').limit(9).get().then(data => {
        let cards = [];
        data.forEach(doc => {
            cards.push({
                cardId: doc.id,
                createdAt: doc.data().createdAt,
                brand: doc.data().brand,
                title: doc.data().title,
                price: doc.data().price,
                photoURL: doc.data().photoURL[0],
                commentCount: doc.data().commentCount
            })
        });
        return res.status(200).json(cards)
    }).catch(err => {
        console.log('error', err)
        return res.status(500).json({error: 'Something went wrong'})
    })
}

exports.getCardsLength = (req,res) => {
    if(req.params.brand === 'All'){
        db.collection('cards').get().then(snap => {
            res.status(200).send({length: snap.size});
        });
    } else {
        db.collection('cards').where('brand', '==', req.params.brand).get().then(snap => {
            res.status(200).send({length: snap.size});
        });
    }
}

exports.uploadExtraCards = (req,res) => {
    if(req.params.brand === 'All'){
        db.collection('cards').limit(6).offset(Number(req.params.size)).get().then(data => {
            let cards = [];
            data.forEach(doc => {
                cards.push({
                    cardId: doc.id,
                    createdAt: doc.data().createdAt,
                    brand: doc.data().brand,
                    title: doc.data().title,
                    price: doc.data().price,
                    photoURL: doc.data().photoURL[0],
                    commentCount: doc.data().commentCount
                })
            });
            return res.status(200).json(cards)
        }).catch(err => {
            console.log('error', err)
            return res.status(500).json({error: 'Something went wrong'})
        })
    } else {
        db.collection('cards').where('brand', '==', req.params.brand).limit(1).offset(Number(req.params.size)).get().then(data => {
            let cards = [];
            data.forEach(doc => {
                cards.push({
                    cardId: doc.id,
                    createdAt: doc.data().createdAt,
                    brand: doc.data().brand,
                    title: doc.data().title,
                    price: doc.data().price,
                    photoURL: doc.data().photoURL[0],
                    commentCount: doc.data().commentCount
                })
            });
            return res.status(200).json(cards)
        }).catch(err => {
            console.log('error', err)
            return res.status(500).json({error: 'Something went wrong'})
        })
    }
}

exports.getAllBrands = (req,res) => {
    db.collection('cards').get().then(data => {
        let cards = [];
        data.forEach(doc => {
            cards.push(doc.data().brand,)
        });
        return res.status(200).json(cards)
    }).catch(err => {
        console.log('error', err)
        return res.status(500).json({error: 'Something went wrong'})
    })
}

exports.getCardsByBrand = (req,res) => {
    db.collection('cards').where('brand', '==', req.params.brand).limit(9).get().then(data => {
        let cards = [];
        data.forEach(doc => {
            cards.push({
                cardId: doc.id,
                createdAt: doc.data().createdAt,
                brand: doc.data().brand,
                title: doc.data().title,
                price: doc.data().price,
                photoURL: doc.data().photoURL[0],
                commentCount: doc.data().commentCount
            })
        });
        return res.status(200).json(cards)
    }).catch(err => {
        console.log('error', err)
        return res.status(500).json({error: 'Something went wrong'})
    })
}

exports.getCardById = (req, res) => {
    let cardData = {};
    db.doc(`/cards/${req.params.cardId}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(400).json({error: 'Card not found'});
            }
            cardData = doc.data();
            cardData.cardId = doc.id;
            return db
                .collection('comments')
                .where('cardId', '==', req.params.cardId)
                .get();
        })
        .then((data) => {
            cardData.comments = [];
            data.forEach((doc) => {
                const resComment = {
                    commentId: doc.id,
                    firstName: doc.data().firstName,
                    lastName: doc.data().lastName,
                    body: doc.data().body,
                    createdAt: doc.data().createdAt
                }
                cardData.comments.push(resComment);
            });
            return res.status(200).json(cardData);
        })
        .catch(err => {
            console.error('error ', err)

        })
}

exports.addNewCard = (req,res) => {
    const newCard = {
        brand: req.body.brand,
        title: req.body.title,
        price: req.body.price,
        photoURL: req.body.photoURL,
        about: req.body.about,
        commentCount: 0,
        createdAt: new Date().toISOString(),
    };

    db.collection('cards')
        .add(newCard)
        .then((doc) => {
            const resCard = newCard;
            resCard.cardId = doc.id;
            res.json(resCard);
        })
        .catch((err) => {
            res.status(500).json({ error: err.code });
            console.error(err);
        });
}
