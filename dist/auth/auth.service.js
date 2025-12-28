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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const mailer_service_1 = require("../mailer/mailer.service");
const bcrypt = require("bcrypt");
const google_auth_library_1 = require("google-auth-library");
let AuthService = class AuthService {
    constructor(usersService, jwtService, mailerService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
        this.client = new google_auth_library_1.OAuth2Client('143084504266-m64qjq4oio23hrpc55s0qs86fq84o7sq.apps.googleusercontent.com');
    }
    async verifyGoogleToken(idToken) {
        const ticket = await this.client.verifyIdToken({
            idToken,
            audience: 'TU_CLIENT_ID',
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new common_1.UnauthorizedException('Token de Google no válido');
        }
        const { sub, email, name, picture } = payload;
        return {
            userId: sub,
            email,
            name,
            picture,
        };
    }
    async login(username, password) {
        const user = await this.usersService.validateUser(username, password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const payload = {
            email: user.username,
            sub: user._id,
            role: user.role,
            lastname: user.lastname,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            access_token: accessToken,
            role: user.role,
            name: user.name,
            lastname: user.lastname,
            email: user.username,
            userId: user._id.toString(),
            address: user.address,
            phone: user.phone,
            doc: user.doc,
            company: user.company,
        };
    }
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }
    async sendRecoveryCode(username) {
        const user = await this.usersService.findByEmail(username);
        if (!user)
            throw new Error('Usuario no encontrado');
        const code = Math.floor(100000 + Math.random() * 900000);
        const expiration = new Date(Date.now() + 15 * 60 * 1000);
        await this.usersService.updateUser(user._id, {
            resetPasswordCode: code,
            resetPasswordExpires: expiration,
        });
        await this.mailerService.sendMail(username, 'Código de recuperación de contraseña', `Tu código de recuperación es: ${code}`);
        return { message: 'Código enviado al correo electrónico' };
    }
    async resetPassword(username, code, newPassword) {
        const user = await this.usersService.findByEmail(username);
        if (!user) {
            return {
                success: false,
                message: 'Usuario no encontrado',
                errorCode: 'USER_NOT_FOUND',
            };
        }
        if (user.resetPasswordCode !== code) {
            return {
                success: false,
                message: 'Código de recuperación incorrecto',
                errorCode: 'INVALID_RECOVERY_CODE',
            };
        }
        if (user.resetPasswordExpires < new Date()) {
            return {
                success: false,
                message: 'El código de recuperación ha expirado',
                errorCode: 'RECOVERY_CODE_EXPIRED',
            };
        }
        const hashedPassword = await this.hashPassword(newPassword);
        await this.usersService.updateUser(user._id, {
            password: hashedPassword,
            resetPasswordCode: null,
            resetPasswordExpires: null,
        });
        return { success: true, message: 'Contraseña cambiada exitosamente' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        mailer_service_1.MailerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map