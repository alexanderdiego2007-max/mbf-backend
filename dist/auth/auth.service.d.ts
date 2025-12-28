import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailerService } from '../mailer/mailer.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly mailerService;
    constructor(usersService: UsersService, jwtService: JwtService, mailerService: MailerService);
    private client;
    verifyGoogleToken(idToken: string): Promise<{
        userId: string;
        email: string;
        name: string;
        picture: string;
    }>;
    login(username: string, password: string): Promise<{
        access_token: string;
        role: string;
        name: string;
        email: string;
        lastname: string;
        userId: string;
        address?: string;
        phone?: string;
        doc?: string;
        company?: string;
    }>;
    private hashPassword;
    sendRecoveryCode(username: string): Promise<{
        message: string;
    }>;
    resetPassword(username: string, code: number, newPassword: string): Promise<{
        success: boolean;
        message: string;
        errorCode: string;
    } | {
        success: boolean;
        message: string;
        errorCode?: undefined;
    }>;
}
