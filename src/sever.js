const express = require('express');
const bodyParser = require('body-parser');
const configViewEngine = require('./configs/viewEngine');
const initWebRoutes = require('./routes/web');
const chatbotService = require('./services/chatbotServices')

let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//config view engine
configViewEngine(app);

//config web routes
initWebRoutes(app);

chatbotService.getLunchMenuTemplate();

let port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log("App is running with port" + port);
})