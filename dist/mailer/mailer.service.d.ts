import { ConfigService } from '@nestjs/config';
export declare class MailerService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendMail(to: string, subject: string, text: string): Promise<void>;
}
