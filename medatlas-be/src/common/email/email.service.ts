import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../../config/config.service';
import { loadTemplate, renderTemplate } from './utils/email-template.util';
import {
  InviteEmailData,
  PasswordResetEmailData,
} from './interface/email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  private inviteTemplate?: string;
  private resetTemplate?: string;

  constructor(private configService: ConfigService) {
    void this.initializeTransporter();
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
    this.resetTemplate = loadTemplate('reset-password-email.html');
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

  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const subject = 'Reset your password';
    const html = this.resetTemplate
      ? renderTemplate(this.resetTemplate, {
          userName: data.userName || 'there',
          resetUrl: data.resetUrl,
        })
      : this.generateFallbackReset(data);

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
      this.logger.log(`Email sent to ${to}`);
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

  private generateFallbackReset(data: PasswordResetEmailData): string {
    return `
      <h2>Password Reset Request</h2>
      <p>Hello ${data.userName || 'there'},</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${data.resetUrl}">Reset Password</a></p>
    `;
  }
}
