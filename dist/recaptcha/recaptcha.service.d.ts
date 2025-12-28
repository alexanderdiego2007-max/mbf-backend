import { HttpService } from '@nestjs/axios';
export declare class RecaptchaService {
    private httpService;
    constructor(httpService: HttpService);
    validateCaptcha(captchaToken: string): Promise<boolean>;
}
