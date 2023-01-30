const express = require('express');
const homeController = require('../controller/HomeController');
const reserveTable = require('../controller/reserveTableController');

let router = express.Router();
let initWebRoutes = (app) => {
    router.get("/", homeController.getHomePage);

    router.post("/setup-profile", homeController.setupProfile);
    router.post("/setup-persistent-menu", homeController.setupPersistentMenu);

    router.post("/webhook", homeController.postWebHook);
    router.get("/webhook", homeController.getWebHook);

    router.get("/reserve-table/:sender_psid", reserveTable.handleReserveTable);

    router.post("/reserve-table-ajax", reserveTable.handlePostReserveTable);

    return app.use("/", router)
}

module.exports = initWebRoutes;