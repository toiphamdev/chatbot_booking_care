require('dotenv').config();
const request = require('request');
const chatbotServices = require('../services/chatbotServices');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;



let getHomePage = (req, res) => {
    return res.render('homepage.ejs')
}

let postWebHook = (req, res) => {
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
}

let getWebHook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
}

// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;

    // Checks if the message contains text
    if (received_message.text) {
        // Create the payload for a basic text message, which
        // will be added to the body of our request to the Send API
        response = {
            "text": `Bạn đã gửi: "${received_message.text}".\n Hãy click vào nút HƯỚNG DẪN SỬ DỤNG để trò chuyện với mình!`
        }
    } else if (received_message.attachments) {
        // Get the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Is this the right picture?",
                        "subtitle": "Tap a button to answer.",
                        "image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }

    // Send the response message
    callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    switch (payload) {
        case 'yes':
            response = { "text": "Thanks!" }
        case 'no':
            response = { "text": "Oops, try sending another image." }
            break;
        case 'RESTART_BOT':
        case 'GET_STARTED':
            await chatbotServices.handleGetStarted(sender_psid);
            break;
        case 'MAIN_MENU':
            await chatbotServices.handleSendMainMenu(sender_psid);
            break;
        case 'LUNCH_MENU':
            await chatbotServices.handleSendLunchMenu(sender_psid);
            break;
        case 'DINNER_MENU':
            await chatbotServices.handleSendDinnerMenu(sender_psid);
            break;
        case 'VIEW_APPETIZES':
            await chatbotServices.handleDetailAppetizes(sender_psid);
            break;
        case 'VIEW_PEARS':
            await chatbotServices.handleDetailPears(sender_psid);
            break;
        case 'VIEW_CHICKEN':
            await chatbotServices.handleDetailChicken(sender_psid);
            break;
        case 'BACK_MAIN_MENU':
            await chatbotServices.handleBackMainMenu(sender_psid);
            break;
        case 'SHOW_ROOMS':
            await chatbotServices.handleDetailRooms(sender_psid);
            break;
        case 'GUID_TO_USE':
            await chatbotServices.handleGuidToUse(sender_psid);
            break;
        default:
            response = { "text": `oh! Mình không hiểu ${payload}.` }
            break;
    }
    // Send the message to acknowledge the postback
    // callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
async function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    await sendMarkSeenMessage(sender_psid);
    await sendTypingOn(sender_psid);

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

function sendTypingOn(sender_psid) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "sender_action": "typing_on"
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(body)
        if (!err) {
            console.log('sent typing on!')
        } else {
            console.error("Unable to typing on:" + err);
        }
    });
}

function sendMarkSeenMessage(sender_psid) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "sender_action": "mark_seen"
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('o dau ra day coi!')
        } else {
            console.error("Unable to typing on:" + err);
        }
    });
}


let setupProfile = async (req, res) => {
    // call profile facebook api
    // Construct the message body
    let request_body = {
        "get_started": { payload: "GET_STARTED" },
        "whitelisted_domains": ["https://swolf-bot-tv.herokuapp.com/"],
    }

    // Send the HTTP request to the Messenger Platform
    await request({
        "uri": `https://graph.facebook.com/v13.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(body)
        if (!err) {
            console.log('set up user profile success!')
        } else {
            console.error("Unable to set up user profile:" + err);
        }
    });
    return res.send("set up user profile success!");
}

let setupPersistentMenu = async (req, res) => {
    // Construct the message body
    let request_body = {
        "persistent_menu": [
            {
                "locale": "default",
                "composer_input_disabled": false,
                "call_to_actions": [
                    {
                        "type": "web_url",
                        "title": "Nhắn tin trực tiếp!",
                        "url": "https://www.facebook.com/toi.pham.12720/",
                        "webview_height_ratio": "full"
                    },
                    {
                        "type": "web_url",
                        "title": "Facebook Page",
                        "url": "https://www.facebook.com/Restaurant-with-Swolf-100901505936112",
                        "webview_height_ratio": "full"
                    },
                    {
                        "type": "postback",
                        "title": "Bắt đầu lại",
                        "payload": "RESTART_BOT"
                    }
                ]
            }
        ]
    }

    // Send the HTTP request to the Messenger Platform
    await request({
        "uri": `https://graph.facebook.com/v13.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        console.log(body)
        if (!err) {
            console.log('set up user persistent menu success!')
        } else {
            console.error("Unable to set up  persistent menu:" + err);
        }
    });
    return res.send("set up persistent menu success!");
}


module.exports = {
    getHomePage: getHomePage,
    postWebHook: postWebHook,
    getWebHook: getWebHook,
    setupProfile: setupProfile,
    setupPersistentMenu: setupPersistentMenu,

}