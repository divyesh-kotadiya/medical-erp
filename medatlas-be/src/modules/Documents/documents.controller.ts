import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}
  @Get()
  find(@Query('tenantId') tenantId: string) {
    return this.documentsService.findForTenant(tenantId);
  }
  @Post()
  create(@Body() body: any) {
    return this.documentsService.create(body);
  }
}
