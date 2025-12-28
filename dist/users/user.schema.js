"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
exports.UserSchema = new mongoose_1.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    company: { type: String, required: true },
    doc: { type: String, required: true },
    position: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    check: { type: String, required: true },
    resetPasswordCode: { type: Number, required: false },
    resetPasswordExpires: { type: Date, required: false },
    role: { type: String, required: true },
    address: { type: String, required: false },
    phone: { type: String, required: false },
});
//# sourceMappingURL=user.schema.js.map