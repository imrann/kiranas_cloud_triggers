




const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().functions);


const foo = require('./onCreateTrigger');
const bar = require('./onUpdateTrigger');
exports.onNewOrder = foo.onNewOrder;
exports.onUpdateOrder = bar.onUpdateOrder;
