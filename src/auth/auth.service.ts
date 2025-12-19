import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { randomBytes } from 'crypto';

import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private mailService: MailService,
    ) { }

    async register(createUserDto: CreateUserDto): Promise<User> {
        const { email, password, fullName } = createUserDto;

        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Cet email est déjà utilisé.');
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = randomBytes(32).toString('hex');

        const user = this.userRepository.create({
            fullName,
            email,
            password: hashedPassword,
            verificationToken,
        });

        await this.userRepository.save(user);
        await this.mailService.sendVerificationEmail(user, verificationToken);
        return user;
    }

    async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('Email ou mot de passe incorrect.');
        }

        if (!user.isVerified) {
            throw new UnauthorizedException('Please verify your email address.');
        }

        const payload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);

        return { accessToken };
    }

    async verifyEmail(token: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { verificationToken: token } });
        if (!user) {
            throw new BadRequestException('Invalid verification token.');
        }
        user.isVerified = true;
        user.verificationToken = null;
        await this.userRepository.save(user);
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
        const { email } = forgotPasswordDto;
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            return; // Do not reveal if user exists
        }

        const token = randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // 1 hour expiry

        user.resetToken = token;
        user.resetTokenExpires = expires;
        await this.userRepository.save(user);

        await this.mailService.sendPasswordReset(user, token);
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
        const { token, newPassword } = resetPasswordDto;
        const user = await this.userRepository.findOne({ where: { resetToken: token } });

        if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            throw new BadRequestException('Le jeton est invalide ou a expiré.');
        }

        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetToken = null;
        user.resetTokenExpires = null;

        await this.userRepository.save(user);
    }

    async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { oldPassword, newPassword } = changePasswordDto;
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
            throw new UnauthorizedException('L\'ancien mot de passe est incorrect.');
        }

        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(newPassword, salt);

        await this.userRepository.save(user);
    }
}
