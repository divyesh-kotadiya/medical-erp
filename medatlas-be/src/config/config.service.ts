import * as dotenv from 'dotenv';
import { join } from 'path';

export class ConfigService {
  private readonly envConfig: { [key: string]: string | undefined };
  private readonly nodeEnv: string;

  constructor() {
    this.nodeEnv = this.detectEnvironment();

    const envFile = `.env.${this.nodeEnv}`;
    const result = dotenv.config({ path: join(process.cwd(), envFile) });

    if (result.error) {
      const defaultResult = dotenv.config();
      if (defaultResult.error) {
        this.envConfig = process.env;
      } else {
        this.envConfig = defaultResult.parsed || {};
      }
    } else {
      this.envConfig = result.parsed || {};
    }

    this.envConfig = { ...this.envConfig, ...process.env };
  }

  private detectEnvironment(): string {
    if (process.env.NODE_ENV) {
      return process.env.NODE_ENV;
    }

    const npmScript = process.env.NODE_ENV!;

    if (npmScript.includes('start:production')) {
      return 'production';
    } else if (npmScript.includes('start:staging')) {
      return 'staging';
    } else if (npmScript.includes('start:dev') || npmScript.includes('start')) {
      return 'development';
    }

    return 'development';
  }

  getNodeEnv(): string {
    return this.nodeEnv;
  }

  getMongodbConfig() {
    return {
      uri: this.envConfig['MONGO_URI'],
    };
  }

  getJWTSecretKey(): string {
    const secret = this.envConfig['JWT_SECRET'];
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return secret;
  }

  getPort(): string {
    return this.envConfig['PORT']!;
  }

  getGlobalAPIPrefix(): string {
    return 'api';
  }

  getDatabaseName(): string {
    switch (this.nodeEnv) {
      case 'development':
        return 'medatlas_dev';
      case 'staging':
        return 'medatlas_staging';
      case 'production':
        return 'medatlas_prod';
      default:
        return 'medatlas_dev';
    }
  }

  isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  isStaging(): boolean {
    return this.nodeEnv === 'staging';
  }

  isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  getEnvironmentWarning(): string {
    if (this.isProduction()) {
      return '🚨 PRODUCTION ENVIRONMENT - All changes affect real users!';
    } else if (this.isStaging()) {
      return '⚠️  STAGING ENVIRONMENT - Test data only';
    } else {
      return '🔧 DEVELOPMENT ENVIRONMENT - Safe for testing';
    }
  }

  getEmailConfig() {
    return {
      type: this.envConfig['EMAIL_TYPE'],
      host: this.envConfig['EMAIL_HOST'],
      port: parseInt(this.envConfig['EMAIL_PORT'] || '587'),
      secure: this.envConfig['EMAIL_SECURE'] === 'true',
      user: this.envConfig['EMAIL_USER'],
      password: this.envConfig['EMAIL_PASSWORD'],
      from: this.envConfig['EMAIL_FROM'] || 'noreply@medatlas.com',
    };
  }

  getJwtConfig() {
    return {
      secret: this.getJWTSecretKey(),
      signOptions: { expiresIn: '1h' },
    };
  }

  getCorsConfig() {
    if (this.isDevelopment()) {
      return {
        origin: this.envConfig['CORS_ORIGIN_DEV'],
        credentials: true,
      };
    } else if (this.isStaging()) {
      return {
        origin: this.envConfig['CORS_ORIGIN_STAGING'],
        credentials: true,
      };
    } else if (this.isProduction()) {
      return {
        origin: this.envConfig['CORS_ORIGIN_PROD'],
        credentials: true,
      };
    }
    return {
      origin: 'http://localhost:3000',
      credentials: true,
    };
  }
}
