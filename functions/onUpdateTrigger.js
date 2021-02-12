const functions = require('firebase-functions');
const admin = require('firebase-admin');

 
var updatedOrder;
var olderOrder;

 

exports.onUpdateOrder = functions.firestore.document('orders/{id}').onUpdate(async (snapshot, context) => {


   
    
	

	if (snapshot.empty) {
		console.log('No Devices');
		return;
    }
    
    olderOrder = snapshot.before.data();
    updatedOrder = snapshot.after.data();
    
    var payload;

    var deviceTokenRef;

    


    if (olderOrder.oTrackingStatus !== updatedOrder.oTrackingStatus) { 
        if (updatedOrder.oTrackingStatus === 'Cancelled by user') {
             deviceTokenRef =await admin.firestore().collection('ownerDeviceToken').get();
        } else {
             deviceTokenRef =await admin.firestore().collection('customerDeviceToken').where('userID', '==', updatedOrder.oUserID).get();
        }

        var tokensToSend = [];


        switch (updatedOrder.oTrackingStatus) {
            case "Cancelled by owner":
                tokensToSend =   getDeviceTokens(deviceTokenRef);
                payload = getPayload("Order cancelled by owners at KIRANAS ",
                            'Cancelled on :' + updatedOrder['oUpdateDate'] + "\n" + 'Order ID :' + updatedOrder['orderID'],
                    'https://firebasestorage.googleapis.com/v0/b/kiranas-c082f.appspot.com/o/Products%2Fkiranas_cancelorder_fcm_image.png?alt=media&token=37f6eefa-4b82-472c-a24d-3bc880d2ca95',
                2);
                
                break;
            case "Cancelled by user":

                tokensToSend = getDeviceTokens(deviceTokenRef);
                payload = getPayload("Order cancelled by customer " + updatedOrder['oUserName'] + " (" +  updatedOrder['oUserPhone'] + ") ",
                            'Cancelled on :' +updatedOrder['oUpdateDate'] +"\n"+ 'Order ID :' +updatedOrder['orderID'],
                    'https://firebasestorage.googleapis.com/v0/b/kiranas-c082f.appspot.com/o/Products%2Fkiranas_cancelorder_fcm_image.png?alt=media&token=37f6eefa-4b82-472c-a24d-3bc880d2ca95',
                2);
                
                break;
            case "Accepted":
                tokensToSend = getDeviceTokens(deviceTokenRef);
                payload = getPayload("Order accepted by owners at KIRANAS ",
                            'Accepted on :' +updatedOrder['oUpdateDate'] +"\n"+ 'Order ID :' +updatedOrder['orderID'],
                    'https://firebasestorage.googleapis.com/v0/b/kiranas-c082f.appspot.com/o/Products%2Fkiranas_acceptedorder_fcm_image.PNG?alt=media&token=fd9c0812-8419-4afc-87b0-ea2b8a6145be',
                0);

                
                break;
            case "Out for Delivery":
                tokensToSend = getDeviceTokens(deviceTokenRef);
                payload = getPayload("Order out for delivery by owners ",
                            'Out for Delivery on :' +updatedOrder['oUpdateDate'] +"\n"+ 'Order ID :' +updatedOrder['orderID'],
                    'https://firebasestorage.googleapis.com/v0/b/kiranas-c082f.appspot.com/o/Products%2Fkiranas_outfordeliverorder_fcm_image.png?alt=media&token=8d3959b9-687a-4146-9e26-f1132ff7d18b',
                0);
                
                break;
            case "Delivered":
                tokensToSend = getDeviceTokens(deviceTokenRef);
                payload = getPayload("Order delivered by owners",
                            'Delivered on :' +updatedOrder['oUpdateDate'] +"\n"+ 'Order ID :' +updatedOrder['orderID'],
                    'https://firebasestorage.googleapis.com/v0/b/kiranas-c082f.appspot.com/o/Products%2Fkiranas_deliveredorder_fcm_image.png?alt=media&token=e1e88433-bc22-43e6-aec4-210a4e94113c',
                      1);
                
                    break;
        
            default:
                break;
        }



        try {
            const response = await admin.messaging().sendToDevice(tokensToSend, payload); 
            tokensToSend = [];
            console.log('Notification sent successfully');
        } catch (err) {
            console.log(err);
        }
  

    }

  
});


function getDeviceTokens(deviceIdTokens) {
    var tokensList = [];

     console.log("token : "+deviceIdTokens.size); 

    for (var token of deviceIdTokens.docs) {
        console.log("token : "+token.data().token);
        tokensList.push(token.data().token);
    }
    return tokensList;

}
 



function getPayload(titleContent,bodyContent,imageContent,message){
    var payloadSkeleton = {
        notification: {
            title: titleContent,
              body:  bodyContent,
              sound: 'default',
              image:imageContent,
              
             
        },
        data: {
            message: message,
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            screen: "OrdersPage",
            title: titleContent,
            body:  bodyContent,
            sound: 'default',
            image:imageContent,
              
        },
    };

    return payloadSkeleton;

}


 
