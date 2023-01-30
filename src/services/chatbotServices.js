require('dotenv').config();
const db = require('../models/index');
let { response } = require('express');
const request = require('request');
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const IMAGE_GETSTARTED = "https://www.volcano-view.com/uploads/nr_photos/RESTAURANTS__3876.jpg";
const IMAGE_MAINMENU = "https://toplist.vn/images/800px/nha-hang-lannam-140421.jpg";
const IMAGE_ROOM = "https://globalwoman.vn/wp-content/uploads/2017/07/nha-hang-be-vang-3.jpg";
const IMAGE_TIMESTART = "https://toplist.vn/images/800px/nha-hang-to-chuc-tiec-cuoi-dep-tai-da-nang-104393.jpg";
const IMAGE_APPETIZES = "https://static.wixstatic.com/media/d253bb_d7bf67d93e8d4e158e0939683cd521c5~mv2.jpg/v1/fill/w_863,h_576,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/d253bb_d7bf67d93e8d4e158e0939683cd521c5~mv2.jpg";
const IMAGE_PEARS = "https://static.wixstatic.com/media/d253bb_4119d27fe09e47bdad26873867dcd102~mv2.jpg/v1/fill/w_707,h_478,al_c,lg_1,q_80,enc_auto/d253bb_4119d27fe09e47bdad26873867dcd102~mv2.jpg";
const IMAGE_CHICKEN = "https://lescordonbleus.ch/wp-content/uploads/2013/11/chavez01.jpg";

let callSendAPI = async (sender_psid, response) => {
    return new Promise(async (resolve, reject) => {
        try {
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
                "uri": "https://graph.facebook.com/v13.0/me/messages",
                "qs": { "access_token": PAGE_ACCESS_TOKEN },
                "method": "POST",
                "json": request_body
            }, (err, res, body) => {
                if (!err) {
                    resolve('message sent!')
                } else {
                    console.error("Unable to send message:" + err);
                }
            });
        } catch (e) {
            reject(e)
        }
    })
}

let getUserName = (sender_psid) => {
    // Send the HTTP request to the Messenger Platform
    return new Promise((resolve, reject) => {
        let userName = "";
        request({
            "uri": `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
            "method": "GET",
        }, (err, res, body) => {
            if (!err) {
                body = JSON.parse(body);
                userName = `${body.last_name} ${body.first_name}`
                resolve(userName);
            } else {
                console.error("Unable to send message:" + err);
                reject(err);
            }
        });
        return userName;
    })
}

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userName = await getUserName(sender_psid);
            let response1 = { "text": `Chào mừng ${userName} đến với nhà hàng Swolf.` };
            let response2 = getStartedTemplate(sender_psid);
            await callSendAPI(sender_psid, response1);
            await callSendAPI(sender_psid, response2);
            resolve('done');

        } catch (e) {
            reject(e);
        }
    })
}

let getStartedTemplate = (sender_psid) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Nhà hàng Swolf kính chào quý khách!",
                    "subtitle": "Dưới đây là các lựa chọn của nhà hàng:",
                    "image_url": IMAGE_GETSTARTED,
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "MENU CHÍNH",
                            "payload": "MAIN_MENU",
                        },
                        {
                            "type": "web_url",
                            "title": "ĐẶT BÀN NGAY",
                            "url": `${process.env.URL_WEB_VIEW_REVERVE_TABLE}/${sender_psid}`,
                            "webview_height_ratio": "tall",
                            "messenger_extensions": true,
                        },
                        {
                            "type": "postback",
                            "title": "HƯỚNG DẪN SỬ DỤNG BOT",
                            "payload": "GUID_TO_USE",
                        }
                    ],
                }]
            }
        }
    }
    return response;
}

let handleSendMainMenu = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getMainMenuTemplate(sender_psid);
            await callSendAPI(sender_psid, response);
            resolve('done');

        } catch (e) {
            reject(e);
        }
    })
}

let getMainMenuTemplate = (sender_psid) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Menu của nhà hàng",
                        "subtitle": "Chúng tôi hân hạnh mang đến cho bạn thực đơn buổi trưa hoặc buổi tối",
                        "image_url": IMAGE_MAINMENU,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "BUỔI TRƯA",
                                "payload": "LUNCH_MENU",
                            },
                            {
                                "type": "postback",
                                "title": "BUỔI TỐI",
                                "payload": "DINNER_MENU",
                            }
                        ],
                    },
                    {
                        "title": "Thời gian mở cửa:",
                        "subtitle": "T2-T6 10AM - 11PM | T7 5PM - 10PM | CN 6PM - 9PM",
                        "image_url": IMAGE_TIMESTART,
                        "buttons": [
                            {
                                "type": "web_url",
                                "title": "ĐẶT BÀN NGAY",
                                "url": `${process.env.URL_WEB_VIEW_REVERVE_TABLE}/${sender_psid}`,
                                "webview_height_ratio": "tall",
                                "messenger_extensions": true,
                            },
                        ],
                    },
                    {
                        "title": "Không gian nhà hàng:",
                        "subtitle": "Nhà hàng có sức chứa 300 khách ngồi và phục vụ các bữa tiệc lớn.",
                        "image_url": IMAGE_ROOM,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "CHI TIẾT",
                                "payload": "SHOW_ROOMS",
                            },
                        ],
                    }

                ]
            }
        }
    }
    return response;
}

let handleSendLunchMenu = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await getLunchMenuTemplate();
            await callSendAPI(sender_psid, response);
            resolve('done');

        } catch (e) {
            reject(e);
        }
    })
}

let getLunchMenuTemplate = async () => {
    let data = await db.Product.findAll({
        raw: true
    });
    let elements = [];
    if (data && data.length > 0) {
        data.map(item => {
            return elements.push({
                "title": item.title,
                "subtitle": item.subtitle,
                "image_url": item.image_url,
                "buttons": [
                    {
                        "type": "postback",
                        "title": "XEM CHI TIẾT",
                        "payload": item.payload,
                    }
                ]
            })
        })
    }
    elements.push({
        "title": "Quay lại",
        "subtitle": "Quay lại menu chính",
        "image_url": IMAGE_MAINMENU,
        "buttons": [
            {
                "type": "postback",
                "title": "MENU CHÍNH",
                "payload": "BACK_MAIN_MENU",
            }
        ],
    });
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                ]
            }
        }
    }
    response.attachment.payload.elements = elements;
    return response;
}

let handleSendDinnerMenu = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await getDinnerMenuTemplate();
            await callSendAPI(sender_psid, response);
            resolve('done');

        } catch (e) {
            reject(e);
        }
    })
}

let getDinnerMenuTemplate = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Món khai vị:",
                        "subtitle": "Đa dạng với hơn 30 món ăn theo phong cách Âu, Việt.",
                        "image_url": IMAGE_APPETIZES,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "XEM CHI TIẾT",
                                "payload": "VIEW_APPETIZES",
                            }
                        ],
                    },
                    {
                        "title": "Gà Cordon Bleu",
                        "subtitle": " Được trang trí trên những chiếc đĩa trắng muốt sang trọng, thường ăn kèm với măng tây.",
                        "image_url": IMAGE_CHICKEN,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "CHI TIẾT",
                                "payload": "VIEW_CHICKEN",
                            },
                        ],
                    },
                    {
                        "title": "Quay lại",
                        "subtitle": "Quay lại menu chính",
                        "image_url": IMAGE_MAINMENU,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "MENU CHÍNH",
                                "payload": "BACK_MAIN_MENU",
                            }
                        ],
                    },

                ]
            }
        }
    }
    return response;
}

let handleBackMainMenu = async (sender_psid) => {
    await handleSendMainMenu(sender_psid);
}

let handleDetailAppetizes = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getDetailAppetizes(sender_psid);
            await callSendAPI(sender_psid, response);
            resolve('done');

        } catch (e) {
            reject(e);
        }
    })
}

let getDetailAppetizes = (sender_psid) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "SOUP BOUILLABAISSE",
                        "subtitle": "Price: 230$",
                        "image_url": "https://cdn.daynauan.info.vn/wp-content/uploads/2019/05/mon-khai-vi-chau-au-noi-tieng.jpg",
                    },
                    {
                        "title": "SOUP À L’OIGNON",
                        "subtitle": "Price: 339$",
                        "image_url": "https://cdn.daynauan.info.vn/wp-content/uploads/2019/05/soup-a-loignon.jpg",

                    },
                    {
                        "title": "SOUP SOLYANKA CỦA NGA",
                        "subtitle": "Price: 430$",
                        "image_url": "https://cdn.daynauan.info.vn/wp-content/uploads/2019/05/soup-solyanka.jpg",

                    },
                    {
                        "title": "Đặt bàn ngay",
                        "subtitle": "Quý khách vui lòng tương tác với nhân viên để dặt bàn.",
                        "image_url": "https://nhahangdep.vn/wp-content/uploads/2019/10/chi-ban-cach-thiet-ke-nha-hang-buffet-dat-chuan-3.jpg",
                        "buttons": [
                            {
                                "type": "web_url",
                                "title": "ĐẶT BÀN NGAY",
                                "url": `${process.env.URL_WEB_VIEW_REVERVE_TABLE}/${sender_psid}`,
                                "webview_height_ratio": "tall",
                                "messenger_extensions": true,
                            }
                        ],
                    },
                    {
                        "title": "Quay lại",
                        "subtitle": "Quay lại menu chính",
                        "image_url": IMAGE_MAINMENU,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "MENU CHÍNH",
                                "payload": "BACK_MAIN_MENU",
                            }
                        ],
                    },

                ]
            }
        }
    }
    return response;
}

let handleDetailPears = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getDetailPears();
            await callSendAPI(sender_psid, response);
            resolve('done');

        } catch (e) {
            reject(e);
        }
    })
}

let getDetailPears = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Lê hầm rượu vang: 500$",
                        "subtitle": "Lê hầm rượu vang là một trong những món tráng miệng vô cùng đặc sắc. Khi hầm, quả lê sẽ ngấm màu đỏ thẫm của rượu vang, lại chín mềm, khi ăn sẽ cảm nhận được vị đậm thơm của rượu.",
                        "image_url": IMAGE_PEARS,
                    },
                    {
                        "title": "Quay lại",
                        "subtitle": "Quay lại menu chính",
                        "image_url": IMAGE_MAINMENU,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "MENU CHÍNH",
                                "payload": "BACK_MAIN_MENU",
                            }
                        ],
                    },

                ]
            }
        }
    }
    return response;
}

let handleDetailChicken = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getDetailChicken();
            await callSendAPI(sender_psid, response);
            resolve('done');

        } catch (e) {
            reject(e);
        }
    })
}

let getDetailChicken = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [
                    {
                        "title": "Gà Cordon Bleu: 600$",
                        "subtitle": " Cơ sở của món ăn này, gà tẩm bột thường được biết đến trên khắp thế giới với tên gọi schnitzel. Một bữa ăn của schnitzel thường bao gồm một miếng thịt, được giã mỏng, sau đó tẩm bột và áp chảo hoặc nướng.",
                        "image_url": IMAGE_CHICKEN,
                    },
                    {
                        "title": "Quay lại",
                        "subtitle": "Quay lại menu chính",
                        "image_url": IMAGE_MAINMENU,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "MENU CHÍNH",
                                "payload": "BACK_MAIN_MENU",
                            }
                        ],
                    },

                ]
            }
        }
    }
    return response;
}

let handleDetailRooms = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = getDetailRoomsImage();
            let response2 = getDetailRoomsButton(sender_psid);
            await callSendAPI(sender_psid, response1);
            await callSendAPI(sender_psid, response2);
            resolve('done');

        } catch (e) {
            reject(e);
        }
    })
}

let getDetailRoomsButton = (sender_psid) => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Nhà hàng có thể phục vụ tối đa 300 khách hàng cùng lúc.",
                "buttons": [
                    {
                        "type": "web_url",
                        "title": "ĐẶT BÀN NGAY",
                        "url": `${process.env.URL_WEB_VIEW_REVERVE_TABLE}/${sender_psid}`,
                        "webview_height_ratio": "tall",
                        "messenger_extensions": true,
                    },
                    {
                        "type": "postback",
                        "title": "MENU CHÍNH",
                        "payload": "BACK_MAIN_MENU",
                    },
                ]
            }
        }
    }
    return response;
}

let getDetailRoomsImage = () => {
    let response = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": "https://spoonuniversity.com/wp-content/uploads/sites/31/2016/06/tumblr_inline_o29fukqwOH1tbsl8q_500.gif",
                "is_reusable": true,
            }
        }
    }
    return response;
}

let sendTypingOn = (sender_psid) => {
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

let sendMarkSeenMessage = (sender_psid) => {
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

let handleGuidToUse = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            // send text mesage
            let userName = await getUserName(sender_psid);
            let response1 = {
                "text": `Xin chào ${userName} mình là chat bot nhà hàng Swolf.\nXin vui lòng xem video hướng dẫn để trò chuyện với mình 😁.`
            };
            // send a video guid
            let response2 = getBotMedia(sender_psid);
            await callSendAPI(sender_psid, response1);
            await callSendAPI(sender_psid, response2);
            resolve('done');

        } catch (e) {
            reject(e);
        }
    })
}

let getBotMedia = () => {
    let response = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "media",
                "elements": [
                    {
                        "media_type": "video",
                        "url": "https://www.facebook.com/watch/?v=542566074164861",
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "MENU CHÍNH",
                                "payload": "MAIN_MENU",
                            },
                        ]
                    }
                ]
            }
        }
    }
    return response;
}


module.exports = {
    handleGetStarted: handleGetStarted,
    handleSendMainMenu: handleSendMainMenu,
    handleSendLunchMenu: handleSendLunchMenu,
    handleSendDinnerMenu: handleSendDinnerMenu,
    handleBackMainMenu: handleBackMainMenu,
    handleDetailAppetizes: handleDetailAppetizes,
    handleDetailPears: handleDetailPears,
    handleDetailChicken: handleDetailChicken,
    handleDetailRooms: handleDetailRooms,
    callSendAPI: callSendAPI,
    getUserName: getUserName,
    handleGuidToUse: handleGuidToUse,
    getLunchMenuTemplate: getLunchMenuTemplate,
};