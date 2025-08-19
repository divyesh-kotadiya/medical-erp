import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../../config/config.service';
import * as fs from 'fs';
import * as path from 'path';

export interface InviteEmailData {
  to: string;
  organizationName: string;
  inviteUrl: string;
  adminName?: string;
  expiresIn?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private inviteEmailTemplate?: string;
  private resetPasswordEmailTemplate?: string;

  constructor(private configService: ConfigService) {
    void this.initializeTransporter();
    this.loadTemplates();
  }

  async sendEmail(input: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.configService.getEmailConfig().from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
      });
      this.logger.log(`Email sent to ${input.to}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send email to ${input.to}`, err);
      return false;
    }
  }

  private async initializeTransporter() {
    const emailConfig = this.configService.getEmailConfig();

    if (emailConfig.type === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: { user: emailConfig.user, pass: emailConfig.password },
      });
    } else if (emailConfig.type === 'gmail') {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailConfig.user, pass: emailConfig.password },
      });
    } else if (emailConfig.type === 'sendgrid') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: { user: 'apikey', pass: emailConfig.password },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: 'test@ethereal.email', pass: 'test123' },
      });
    }

    try {
      await this.transporter.verify();
      this.logger.log('Email service initialized successfully');
    } catch (err) {
      this.logger.error('Failed to initialize email service', err as any);
    }
  }

  private loadTemplates(): void {
    try {
      const templatesDir = path.join(__dirname, 'templates');
      const invitePath = path.join(templatesDir, 'invite-email.html');
      const resetPasswordPath = path.join(
        templatesDir,
        'reset-password-email.html',
      );
      if (fs.existsSync(invitePath)) {
        this.inviteEmailTemplate = fs.readFileSync(invitePath, 'utf8');
        this.logger.log('Invite email template loaded');
      } else {
        this.logger.warn('Invite email template not found, using fallback');
      }
      if (fs.existsSync(resetPasswordPath)) {
        this.resetPasswordEmailTemplate = fs.readFileSync(
          resetPasswordPath,
          'utf8',
        );
        this.logger.log('Reset password email template loaded');
      } else {
        this.logger.warn(
          'Reset password email template not found, using fallback',
        );
      }
    } catch (err) {
      this.logger.error('Failed to load email templates', err as any);
    }
  }

  async sendInviteEmail(data: InviteEmailData): Promise<boolean> {
    const subject = `You've been invited to join ${data.organizationName}`;
    const html = this.inviteEmailTemplate
      ? this.renderTemplate(this.inviteEmailTemplate, {
          organizationName: data.organizationName,
          inviteUrl: data.inviteUrl,
          adminName: data.adminName || 'Admin',
          expiresIn: data.expiresIn || '7 days',
        })
      : this.generateInviteEmailHTML({
          organizationName: data.organizationName,
          inviteUrl: data.inviteUrl,
          adminName: data.adminName || 'Admin',
          expiresIn: data.expiresIn || '7 days',
        });

    try {
      await this.transporter.sendMail({
        from: this.configService.getEmailConfig().from,
        to: data.to,
        subject,
        html,
      });
      this.logger.log(`Invite email sent to ${data.to}`);
      return true;
    } catch (err) {
      this.logger.error(`Failed to send invite email to ${data.to}`, err);
      return false;
    }
  }

  private renderTemplate(
    template: string,
    data: Record<string, string>,
  ): string {
    let rendered = template;
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const safe = data[key] ?? '';
        rendered = rendered.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), safe);
      }
    }
    return rendered;
  }

  private generateInviteEmailHTML(input: {
    organizationName: string;
    inviteUrl: string;
    adminName: string;
    expiresIn: string;
  }): string {
    return `
      <html>
      <head><meta charset="utf-8" /></head>
      <body style="font-family: Arial, sans-serif;">
        <h2>Staff Invitation</h2>
        <p>You have been invited by <strong>${input.adminName}</strong> to join <strong>${input.organizationName}</strong>.</p>
        <p>This link will expire in ${input.expiresIn}.</p>
        <p>
          <a href="${input.inviteUrl}" style="background:#28a745;color:#fff;padding:10px 16px;text-decoration:none;border-radius:4px;">Accept Invitation & Register</a>
        </p>
        <p>If you did not expect this invitation, please ignore this email.</p>
      </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(input: {
    to: string;
    userName: string;
    resetUrl: string;
  }): Promise<boolean> {
    const subject = 'Reset your password';
    const html = this.resetPasswordEmailTemplate
      ? this.renderTemplate(this.resetPasswordEmailTemplate, {
          userName: input.userName || 'there',
          resetUrl: input.resetUrl,
        })
      : this.generateResetPasswordEmailHTML({
          userName: input.userName || 'there',
          resetUrl: input.resetUrl,
        });

    try {
      await this.transporter.sendMail({
        from: this.configService.getEmailConfig().from,
        to: input.to,
        subject,
        html,
      });
      this.logger.log(`Password reset email sent to ${input.to}`);
      return true;
    } catch (err) {
      this.logger.error(
        `Failed to send password reset email to ${input.to}`,
        err,
      );
      return false;
    }
  }

  private generateResetPasswordEmailHTML(input: {
    userName: string;
    resetUrl: string;
  }): string {
    return `
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: Arial, sans-serif; background:#f7f9fc; margin:0; padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:24px 24px 0 24px;">
                <h2 style="margin:0 0 12px 0; color:#1a73e8;">Reset your password</h2>
                <p style="margin:0; color:#333333;">Hello ${input.userName},</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px; color:#333333;">
                <p style="margin:0 0 16px;">We received a request to reset your password. Click the button below to set a new one. This link will expire in 1 hour.</p>
                <p style="margin:24px 0;">
                  <a href="${input.resetUrl}" style="display:inline-block;background:#1a73e8;color:#ffffff;padding:12px 18px;border-radius:6px;text-decoration:none;">Reset Password</a>
                </p>
                <p style="margin:0; color:#666666; font-size:14px;">If you didn't request a password reset, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px 24px 24px; color:#999999; font-size:12px;">
                <p style="margin:0;">MedAtlas • Do not reply to this automated email.</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}