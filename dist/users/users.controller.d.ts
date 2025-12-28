import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { RecaptchaService } from 'src/recaptcha/recaptcha.service';
export declare class UsersController {
    private readonly usersService;
    private readonly authService;
    private recaptchaService;
    constructor(usersService: UsersService, authService: AuthService, recaptchaService: RecaptchaService);
    register(body: {
        name: string;
        lastname: string;
        company: string;
        doc: string;
        position: string;
        username: string;
        password: string;
        confirmPassword: string;
        check: number;
        captchaToken: string;
        role: string;
        address?: string;
        phone?: string;
    }): Promise<import("./user.schema").User>;
    login(username: string, password: string, captchaToken: string): Promise<{
        message: string;
        access_token: string;
        role: string;
        name: string;
        email: string;
        lastname: string;
        address: string;
        phone: string;
        userId: string;
        doc: string;
        company: string;
    }>;
    getAllUsers(): Promise<import("./user.schema").User[]>;
    getTechnicians(): Promise<import("./user.schema").User[]>;
    updateUser(id: string, body: {
        name?: string;
        lastname?: string;
        company?: string;
        doc?: string;
        position?: string;
        username?: string;
        password?: string;
        role?: string;
        address?: string;
        phone?: string;
    }): Promise<{
        message: string;
        user: import("./user.schema").User;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    forgotPassword(username: string): Promise<{
        message: string;
    }>;
    resetPassword(code: number, username: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
        errorCode: string;
    } | {
        success: boolean;
        message: string;
        errorCode?: undefined;
    }>;
    googleLogin(idToken: string): Promise<{
        userId: string;
        email: string;
        name: string;
        picture: string;
    }>;
}
