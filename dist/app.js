"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const port = process.env.PORT || 5000;
const app = (0, express_1.default)();
const server = require('http').createServer(app).listen(port);
const io = require('socket.io')(server);
app.use(express_1.default.static('dist/public'));
app.get('/', function (req, res) { res.sendFile('index.html'); });
console.log('Server started at http://localhost:' + port);
//# sourceMappingURL=app.js.map