import * as fs from 'fs';
import * as path from 'path';
import * as juice from 'juice';
import { Logger } from '@nestjs/common';
import { EmailTemplateData } from '../interface/email.interface';

const logger = new Logger('EmailTemplateUtil');

export function loadTemplate(name: string): string | undefined {
  let filePath = path.join(process.cwd(), 'src/common/email/templates', name);

  console.log(filePath, 'this is file path');

  if (!fs.existsSync(filePath)) {
    filePath = path.join(process.cwd(), 'dist/common/email/templates', name);
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
