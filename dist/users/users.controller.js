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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const auth_service_1 = require("../auth/auth.service");
const bcrypt = require("bcrypt");
const recaptcha_service_1 = require("../recaptcha/recaptcha.service");
let UsersController = class UsersController {
    constructor(usersService, authService, recaptchaService) {
        this.usersService = usersService;
        this.authService = authService;
        this.recaptchaService = recaptchaService;
    }
    async register(body) {
        const { name, lastname, company, doc, position, username, password, confirmPassword, check, captchaToken, role, address, phone, } = body;
        const isCaptchaValid = await this.recaptchaService.validateCaptcha(captchaToken);
        if (!isCaptchaValid) {
            throw new common_1.BadRequestException('reCAPTCHA falló, intenta nuevamente.');
        }
        if (!name ||
            !lastname ||
            !company ||
            !doc ||
            !position ||
            !username ||
            !password ||
            !confirmPassword ||
            !check ||
            !captchaToken ||
            !role) {
            throw new common_1.HttpException('All required fields must be filled', common_1.HttpStatus.BAD_REQUEST);
        }
        if (password !== confirmPassword) {
            throw new common_1.HttpException('Passwords do not match', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.usersService.create(name, lastname, company, doc, position, username, password, confirmPassword, check, role, address, phone);
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async login(username, password, captchaToken) {
        const isCaptchaValid = await this.recaptchaService.validateCaptcha(captchaToken);
        if (!isCaptchaValid) {
            throw new common_1.BadRequestException('Invalid reCAPTCHA');
        }
        const user = await this.usersService.findOne(username);
        if (user && (await bcrypt.compare(password, user.password))) {
            const { access_token, role, name, lastname, address, phone, userId, doc, company } = await this.authService.login(username, password);
            return {
                message: 'Login successful',
                access_token,
                role,
                name,
                email: username,
                lastname,
                address,
                phone,
                userId,
                doc,
                company
            };
        }
        throw new common_1.HttpException('Invalid credentials', common_1.HttpStatus.UNAUTHORIZED);
    }
    async getAllUsers() {
        return await this.usersService.findAll();
    }
    async getTechnicians() {
        return await this.usersService.findTechnicians();
    }
    async updateUser(id, body) {
        const { name, lastname, company, doc, position, username, password, role, address, phone, } = body;
        if (!name &&
            !lastname &&
            !company &&
            !doc &&
            !position &&
            !username &&
            !password &&
            !role &&
            !address &&
            !phone) {
            throw new common_1.BadRequestException('No fields provided to update');
        }
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        try {
            const updatedUser = await this.usersService.updateUser(id, {
                name,
                lastname,
                company,
                doc,
                position,
                username,
                password: hashedPassword,
                role,
                address,
                phone,
            });
            if (!updatedUser) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            return { message: 'User updated successfully', user: updatedUser };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to update user', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteUser(id) {
        await this.usersService.deleteUser(id);
        return { message: `User with ID ${id} deleted successfully` };
    }
    async forgotPassword(username) {
        return await this.authService.sendRecoveryCode(username);
    }
    async resetPassword(code, username, newPassword) {
        return await this.authService.resetPassword(username, code, newPassword);
    }
    async googleLogin(idToken) {
        return this.authService.verifyGoogleToken(idToken);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)('username')),
    __param(1, (0, common_1.Body)('password')),
    __param(2, (0, common_1.Body)('captchaToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('technicians'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getTechnicians", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)('code')),
    __param(1, (0, common_1.Body)('username')),
    __param(2, (0, common_1.Body)('newPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('google'),
    __param(0, (0, common_1.Body)('idToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "googleLogin", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        auth_service_1.AuthService,
        recaptcha_service_1.RecaptchaService])
], UsersController);
//# sourceMappingURL=users.controller.js.map