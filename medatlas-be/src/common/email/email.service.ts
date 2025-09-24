import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../../config/config.service';
import { loadTemplate, renderTemplate } from './utils/email-template.util';
import {
  InviteEmailData,
  OtpEmailData,
  PasswordResetEmailData,
} from './interface/email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  private inviteTemplate?: string;
  private otpTemplate?: string;
  private resetSuccessTemplate?: string;
  private resetTemplate?: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeTransporter();
    this.loadTemplates();
  }

  private async initializeTransporter() {
    const config = this.configService.getEmailConfig();

    if (config.type !== 'smtp') {
      this.logger.error('Only SMTP is supported');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });

    try {
      await this.transporter.verify();
      this.logger.log('SMTP Email service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize SMTP transporter', error);
    }
  }

  private loadTemplates() {
    this.inviteTemplate = loadTemplate('invite-email.html');
    this.otpTemplate = loadTemplate('otp-email.html');
    this.resetSuccessTemplate = loadTemplate('reset-password-success.html');
    this.resetTemplate = loadTemplate('forgot-password.html');
  }

  async sendInviteEmail(data: InviteEmailData): Promise<boolean> {
    const subject = `You've been invited to join ${data.organizationName}`;
    const html = this.inviteTemplate
      ? renderTemplate(this.inviteTemplate, {
          organizationName: data.organizationName,
          inviteUrl: data.inviteUrl,
          adminName: data.adminName || 'Admin',
          expiresIn: data.expiresIn || '7 days',
        })
      : this.generateFallbackInvite(data);

    return this.sendMail(data.to, subject, html);
  }

  async sendResetPasswordEmail(data: PasswordResetEmailData): Promise<boolean> {
    const subject = 'Your Reset Password (OTP)';
    const html = this.resetTemplate
      ? renderTemplate(this.resetTemplate, {
          userName: data.userName || 'there',
          otp: data.otp,
          expiresIn: data.expiresIn || '1 minutes',
          currentYear: new Date().getFullYear().toString(),
        })
      : this.generateFallbackOtp(data);
    return this.sendMail(data.to, subject, html);
  }

  async sendPasswordResetSuccessEmail(
    to: string,
    userName: string,
    resetUrl: string,
  ): Promise<boolean> {
    const subject = 'Your Password Has Been Reset';
    const html = this.resetSuccessTemplate
      ? renderTemplate(this.resetSuccessTemplate, {
          userName: userName || 'there',
          currentYear: new Date().getFullYear().toString(),
          resetUrl,
        })
      : this.generateFallbackPasswordResetSuccess(userName);
    return this.sendMail(to, subject, html);
  }

  async sendOtpEmail(data: OtpEmailData): Promise<boolean> {
    const subject = 'Your One-Time Password (OTP)';
    const html = this.otpTemplate
      ? renderTemplate(this.otpTemplate, {
          userName: data.userName || 'there',
          otp: data.otp,
          expiresIn: data.expiresIn || '5 minutes',
          currentYear: new Date().getFullYear().toString(),
        })
      : this.generateFallbackOtp(data);

    return this.sendMail(data.to, subject, html);
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.configService.getEmailConfig().from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to} with subject "${subject}"`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      return false;
    }
  }

  private generateFallbackInvite(data: InviteEmailData): string {
    return `
      <h2>You've been invited to join ${data.organizationName}</h2>
      <p>Invited by: ${data.adminName || 'Admin'}</p>
      <p>This link will expire in ${data.expiresIn || '7 days'}.</p>
      <p><a href="${data.inviteUrl}">Accept Invitation</a></p>
    `;
  }

  private generateFallbackOtp(data: OtpEmailData): string {
    return `
      <h2>Your OTP Code</h2>
      <p>Hello ${data.userName || 'there'},</p>
      <p>Your OTP is: <strong>${data.otp}</strong></p>
      <p>It will expire in ${data.expiresIn || '5 minutes'}.</p>
    `;
  }

  private generateFallbackPasswordResetSuccess(userName: string): string {
    return `
      <h2>Password Reset Successful</h2>
      <p>Hello ${userName || 'there'},</p>
      <p>Your password has been successfully reset. If you did not perform this action, please contact support immediately.</p>
      <p>Best regards,<br/>The Team</p>
    `;
  }
}
