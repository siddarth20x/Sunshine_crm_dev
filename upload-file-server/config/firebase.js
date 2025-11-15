var admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey");
require('dotenv').config();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FB_STORAGE_BUCKET
});

module.exports = admin;