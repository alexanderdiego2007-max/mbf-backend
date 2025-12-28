"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findOne(username) {
        return this.userModel.findOne({ username });
    }
    async findAll() {
        return this.userModel.find().select('-password').exec();
    }
    async deleteUser(id) {
        const result = await this.userModel.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
    }
    async validateUser(username, password) {
        const user = await this.findOne(username);
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }
    async create(name, lastname, company, doc, position, username, password, confirmPassword, check, role, address, phone) {
        const existingUser = await this.findOne(username);
        if (existingUser) {
            throw new common_1.ConflictException('Username already exists');
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const hashedConfirmPassword = await bcrypt.hash(confirmPassword, saltRounds);
        const newUser = new this.userModel({
            name,
            lastname,
            company,
            doc,
            position,
            username,
            password: hashedPassword,
            confirmPassword: hashedConfirmPassword,
            check,
            role,
            address,
            phone,
        });
        return newUser.save();
    }
    async updateUser(id, updateData) {
        const user = await this.userModel.findByIdAndUpdate(id, updateData, {
            new: true,
        });
        return user;
    }
    async findByEmail(username) {
        return this.userModel.findOne({ username }).exec();
    }
    async findTechnicians() {
        return this.userModel.find({ role: 'Tecnico' }).select('-password').exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('User')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map