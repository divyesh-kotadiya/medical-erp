export interface InviteEmailData {
  to: string;
  organizationName: string;
  inviteUrl: string;
  adminName?: string;
  expiresIn?: string;
}

export interface PasswordResetEmailData {
  to: string;
  userName: string;
  otp: string;
  expiresIn?: string;
}

export interface EmailTemplateData {
  [key: string]: string;
}

export interface OtpEmailData {
  to: string;

  userName?: string;

  otp: string;

  expiresIn?: string;
}

export interface PasswordResetSuccessEmailData {
  to: string;
  userName?: string;
}
