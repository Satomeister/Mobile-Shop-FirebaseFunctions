const {db} = require('../util/admin');

exports.addComment = (req, res) => {
    const newComment = {
        cardId: req.body.cardId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        body: req.body.body,
        createdAt: new Date().toISOString()
    };
    db.doc(`/cards/${newComment.cardId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(400).json({error: 'Card not found'});
            }
            doc.ref.update({commentCount: doc.data().commentCount + 1});
        })
        .then(() => {
            db.collection('comments')
                .add(newComment)
                .then((doc) => {
                    const resComment = newComment;
                    resComment.commentId = doc.id;
                    res.json(resComment);
                })
        })
        .catch((err) => {
            res.status(500).json({error: err.code});
            console.error(err);
        });
}

exports.deleteComment = (req, res) => {
    const document = db.doc(`/comments/${req.params.commentId}`);
    db.doc(`/cards/${req.params.cardId}`)
        .get()
        .then((doc) => {
            if (!doc.exists) {
                return res.status(400).json({error: 'Card not found'});
            }
            doc.ref.update({commentCount: doc.data().commentCount - 1});
        })
        .then(() => {
            document
                .get()
                .then((doc) => {
                    if (!doc.exists) {
                        return res.status(400).json({error: 'Comment not found'});
                    }
                    return document.delete();
                })
                .then(() => {
                    res.status(200).json({message: 'Comment deleted successfully'});
                })
        })
        .catch((err) => {
            return res.status(500).json({error: err.code});
        });
}