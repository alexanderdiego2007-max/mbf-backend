import { UsersService } from '../users/users.service';
declare const JwtStrategy_base: new (...args: any[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly usersService;
    constructor(usersService: UsersService);
    validate(payload: any): Promise<import("../users/user.schema").User>;
}
export {};
