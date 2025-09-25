export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  iat?: number;
  exp?: number;
}
