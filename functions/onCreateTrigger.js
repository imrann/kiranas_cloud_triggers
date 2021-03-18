const functions = require('firebase-functions');
const admin = require('firebase-admin');



var newCreatedOrder;

var dateObject;
var humanDateFormat;
     
 
exports.onNewOrder = functions.firestore.document('orders/{id}').onCreate(async (snapshot, context) => {
	

	if (snapshot.empty) {
		console.log('No Devices');
		return;
    }
    
	newCreatedOrder = snapshot.data();
	dateObject = new Date(newCreatedOrder['oDop']);
	dateObject.setMinutes( dateObject.getMinutes() + 330 );
	humanDateFormat = dateObject.toLocaleString();
    var ownerTokens = [];
    var productName = [];
    var productQty = [];

    // for (var order of newOrder['oProducts']) {
    //     productName.push(order['productName']);
    //     productQty.push(order['productQty']);

 	// }
 
	const userDeviceIdTokens = await admin
		.firestore()
		.collection('ownerDeviceToken').get();
		console.log("token : "+userDeviceIdTokens.size); 
	

	for (var token of userDeviceIdTokens.docs) {
		console.log("token : "+token.data().token);
		ownerTokens.push(token.data().token);
 	}

 
 	var payload = {
		notification: {
			title: "New order placed from " + newCreatedOrder['oUserName'],
              body:  'Order Placed on :' + humanDateFormat ,
              sound: 'default',
              image:'https://firebasestorage.googleapis.com/v0/b/kiranas-c082f.appspot.com/o/Products%2Fkiranas_neworder_fcm_image.PNG?alt=media&token=879dd670-f8d5-4eb7-b2d7-fc1c952bd3f1',
              
             
		},
		data: {
            message: "0",
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            screen: "OrdersPage",
            title:  "New order placed from " + newCreatedOrder['oUserName'] + " (" +  newCreatedOrder['oUserPhone'] + ") ",
            body:  'Order Placed on :' +humanDateFormat,
            sound: 'default',
            image:'https://firebasestorage.googleapis.com/v0/b/kiranas-c082f.appspot.com/o/Products%2Fkiranas_neworder_fcm_image.PNG?alt=media&token=879dd670-f8d5-4eb7-b2d7-fc1c952bd3f1',
			  
		},
	};

	try {
		const response = await admin.messaging().sendToDevice(ownerTokens, payload);
		console.log('Notification sent successfully');
	} catch (err) {
		console.log(err);
	}
});


 

 