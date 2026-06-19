"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rootRoutes_1 = __importDefault(require("./routes/rootRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_middleware_1 = require("./middlewares/error.middleware");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true,
}));
// A simple route to test the server is running
app.get('/', (req, res) => {
    res.send('Hello, Flowlit!');
});
app.use('/api', rootRoutes_1.default);
// Global error handler
app.use(error_middleware_1.errorHandler);
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map