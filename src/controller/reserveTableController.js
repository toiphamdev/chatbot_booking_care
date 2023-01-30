const chatbotServices = require('../services/chatbotServices');
const moment = require('moment');
const { GoogleSpreadsheet } = require('google-spreadsheet');

const PRIVATE_KEY = process.env.CLIENT_PRIVATE_KEY;
const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
const SHEET_ID = process.env.SHEET_ID;

let getGoogleSheet = async (data) => {

    let currentDate = new Date();

    const format = "HH:mm DD/MM/YYYY"

    let formatedDate = moment(currentDate).format(format);

    // Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = new GoogleSpreadsheet(SHEET_ID);
    // Initialize Auth - see more available options at https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication
    await doc.useServiceAccountAuth({
        client_email: JSON.parse(`"${CLIENT_EMAIL}"`),
        private_key: JSON.parse(`"${PRIVATE_KEY}"`),
    });
    console.log('sai')
    await doc.loadInfo(); // loads document properties and worksheets
    const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    // append rows
    await sheet.addRow(
        {
            "Tên Facebook": data.userName,
            "Email": data.email,
            "Số điện thoại": `'` + data.phoneNumber,
            "Thời gian": formatedDate,
            "Tên khách hàng": data.customerName,
        });

}

const handleReserveTable = (req, res) => {
    let senderID = req.params.sender_psid;
    res.render('reserveTable.ejs', {
        senderID: senderID,
    });
}

const handlePostReserveTable = async (req, res) => {
    try {

        //ghi du lieu vào excel
        let data = {
            userName: await chatbotServices.getUserName(req.body.psid),
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            customerName: req.body.customerName,
        }

        await getGoogleSheet(data);
        let customerName = "";
        if (req.body.customerName === "") {
            customerName = await chatbotServices.getUserName(req.body.psid);
        } else customerName = req.body.customerName;

        let response1 = {
            "text": `----Thông tin khách hàng----
            Họ và tên: ${customerName}
            Địa chỉ email: ${req.body.email}
            Số điện thoại: ${req.body.phoneNumber}
            `
        }

        let response2 = {

        }

        await chatbotServices.callSendAPI(req.body.psid, response1)

        return res.status(200).json({
            message: "ok"
        });

    } catch {
        console.log('lỗi post infor custum')
        return res.status(500).json({
            message: "error"
        });
    }
}

module.exports = {
    handleReserveTable: handleReserveTable,
    handlePostReserveTable: handlePostReserveTable,
    getGoogleSheet: getGoogleSheet,
}