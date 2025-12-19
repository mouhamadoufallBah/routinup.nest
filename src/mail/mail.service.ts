import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../user/entities/user.entity';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }

    async sendVerificationEmail(user: User, token: string) {
        const url = `http://localhost:3000/auth/verify-email?token=${token}`;

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Vérifiez votre email',
            text: `Bonjour ${user.fullName},\n\nMerci de vous être inscrit. Veuillez utiliser le lien ci-dessous pour vérifier votre email :\n\nLien: ${url}\n\nCordialement,`,
            html: `
        <h3>Bonjour ${user.fullName},</h3>
        <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre email :</p>
        <p>
            <a href="${url}">Vérifier mon email</a>
        </p>
        <p>Cordialement,</p>
      `,
        });
    }

    async sendPasswordReset(user: User, token: string) {
        const url = `http://localhost:3000/auth/reset-password?token=${token}`;

        await this.mailerService.sendMail({
            to: user.email,
            subject: 'Réinitialisation de votre mot de passe',
            text: `Bonjour ${user.fullName},\n\nVous avez demandé la réinitialisation de votre mot de passe. Veuillez utiliser le lien ci-dessous (ou le token) pour le réinitialiser :\n\nLien: ${url}\nToken: ${token}\n\nSi vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.\n\nCordialement,`,
            html: `
        <h3>Bonjour ${user.fullName},</h3>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour le réinitialiser ou utiliser le token :</p>
        <p>
            <a href="${url}">Réinitialiser le mot de passe</a>
        </p>
        <p><strong>Token:</strong> ${token}</p>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
        <p>Cordialement,</p>
      `,
        });
    }
}
