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
  resetUrl: string;
}

export interface EmailTemplateData {
  [key: string]: string;
}
