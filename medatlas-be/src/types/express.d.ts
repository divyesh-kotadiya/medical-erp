import { JwtPayload } from 'jsonwebtoken';

interface AuthJwtPayload extends JwtPayload {
  sub: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthJwtPayload;
  }
}
