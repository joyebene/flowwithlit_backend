"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// This is the single, shared instance of PrismaClient
exports.prisma = global.prisma ||
    new client_1.PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
if (process.env.NODE_ENV !== 'production') {
    global.prisma = exports.prisma;
}
//# sourceMappingURL=db.js.map