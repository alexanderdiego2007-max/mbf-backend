import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
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
        role: string;
    }): Promise<{
        message: string;
        user: import("../users/user.schema").User;
    }>;
    login(body: {
        username: string;
        password: string;
    }): Promise<{
        message: string;
        access_token: string;
        role: string;
        name: string;
        email: string;
        lastname: string;
    }>;
}
