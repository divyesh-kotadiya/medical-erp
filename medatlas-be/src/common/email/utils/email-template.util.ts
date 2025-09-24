import * as fs from 'fs';
import * as path from 'path';
import * as juice from 'juice';
import { Logger } from '@nestjs/common';
import { EmailTemplateData } from '../interface/email.interface';

const logger = new Logger('EmailTemplateUtil');

export function loadTemplate(name: string): string | undefined {
  let templatesDir = path.join(process.cwd(), 'dist/common/email/templates');
  let filePath = path.join(templatesDir, name);

  if (!fs.existsSync(filePath)) {
    templatesDir = path.join(process.cwd(), 'src/common/email/templates');
    filePath = path.join(templatesDir, name);
  }

  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  } else {
    logger.warn(`Email template not found: ${filePath}`);
    return undefined;
  }
}

export function renderTemplate(
  template: string,
  data: EmailTemplateData,
): string {
  let rendered = template;

  for (const key in data) {
    const safe = data[key] ?? '';
    rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), safe);
  }

  rendered = juice(rendered);

  return rendered;
}
