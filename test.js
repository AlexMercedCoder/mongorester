const express = require("express");
const app = express();
const { rester, authy, connmon, reqInject, cbLog } = require("./index");

connmon("mongodb://localhost:27017/mydbname");

app.listen(3000, cbLog("server", "listening on port 3000"));
