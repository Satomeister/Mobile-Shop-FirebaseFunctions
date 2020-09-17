const { admin, db} = require('../util/admin')

const config = require('../util/config')

const firebase = require('firebase');
firebase.initializeApp(config)

/*function isEmpty(value) {
    if (value.trim() === '') return true
    else return false
}*/

function isEmailValid(email) {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return !!email.match(regEx);
}

exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    };

    if (!isEmailValid(newUser.email)) return res.status(400).send({error: 'Email is invalid'})
    if (newUser.password !== newUser.confirmPassword) return res.status(400).send({error: 'Passwords do not match'})

    const userData = {}

    let userId;
    const handle = `${newUser.firstName}_${newUser.lastName}`
    db.doc(`/users/${handle}`)
        .get()
        .then((doc) => {
            if (doc.exists) {
                return res.status(400).send({handle: "this handle is already taken"});
            } else {
                return firebase
                    .auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then((idToken) => {
            userData.token = idToken;
            const userCredentials = {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                userId,
            };
            return db.doc(`/users/${handle}`).set(userCredentials);
        })
        .then(() => {
            return db
                .collection('users')
                .where('email', '==', newUser.email)
                .get();
        })
        .then(data => {
            data.forEach((doc) => {
                userData.userData = {
                    firstName: doc.data().firstName,
                    lastName: doc.data().lastName
                };
            });
            return res.status(200).json(userData);
        })
        .catch((err) => {
            if (err.code === "auth/email-already-in-use") {
                return res.status(400).send({email: "Email is already is use"});
            } else {
                return res
                    .status(500)
                    .send({general: "Something went wrong, please try again"});
            }
        });
};

exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    if (!isEmailValid(user.email)) {
        return res.status(400).json({error: 'Email is invalid'})
    }
    const userData = {}

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            userData.token = token
            return db
                .collection('users')
                .where('email', '==', user.email)
                .limit(1)
                .get();
        })
        .then(data => {
            userData.userData = {
                firstName: data.docs[0].data().firstName,
                lastName: data.docs[0].data().lastName
            };
            return res.status(200).json(userData);
        })
        .catch(err => {
            console.error(err)
            if(err.code === 'auth/wrong-password') {
                return res.status(400).json({error: 'Wrong password, please try again'})
            }
            if (err.code === 'auth/user-not-found') {
                return res.status(400).json({error: 'User is not found, please try again'})
            } else {
                return res.status(500).json({error: err.code})
            }
        })
}

exports.getUserData = (req, res) => {
    admin
        .auth()
        .verifyIdToken(req.params.token)
        .then(decodedToken => {
            return db
                .collection('users')
                .where('userId', '==', decodedToken.uid)
                .limit(1)
                .get();
        })
        .then((data) => {
            return res.status(200).json({
                firstName: data.docs[0].data().firstName,
                lastName: data.docs[0].data().lastName
            })
        })
        .catch(err => {
            return res.status(500).json({error: err.code})
        })
}

exports.logout = (req, res) => {
    firebase.auth().signOut().then(() => {
        return res.status(200).json({message: 'log out success'})
    }).catch((err) => {
        return res.status(500).json({err})
    })
}