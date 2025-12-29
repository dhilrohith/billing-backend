/* eslint-disable prettier/prettier */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  HttpStatus,
  Query,
  Patch,
  HttpException,
} from '@nestjs/common';
import {
  ApiProduces,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { type Response } from 'express';
import { InvoiceService } from './invoice.service';
import { PdfService } from '../pdf/pdf.service';
import { EmailService } from '../email/email.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice } from './schemas/invoice.schema';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
  ) {}

  // Create new invoice
  @ApiTags('Invoices')
  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
    type: Invoice,
  })
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    const invoice = await this.invoiceService.create(createInvoiceDto);
    return {
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
    };
  }

  // Get all invoices
  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({
    status: 200,
    description: 'List of invoices',
    type: [Invoice],
  })
  async findAll() {
    const invoices = await this.invoiceService.findAll();
    return {
      success: true,
      data: invoices,
    };
  }

  // Get single invoice by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', example: '66a7e8c5d8a4e234abcd1234' })
  @ApiResponse({
    status: 200,
    description: 'Invoice details',
    type: Invoice,
  })
  async findOne(@Param('id') id: string) {
    const invoice = await this.invoiceService.findOne(id);
    return {
      success: true,
      data: invoice,
    };
  }

  // Generate and download PDF
  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download invoice PDF' })
  @ApiParam({
    name: 'id',
    description: 'MongoDB Invoice ID',
    example: '66a7e8c5d8a4e234abcd1234',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'Invoice PDF file',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error generating PDF',
  })
  async downloadPDF(@Param('id') id: string, @Res({ passthrough: true }) res: Response,): Promise<Buffer> {
    try {
      const invoice = await this.invoiceService.findOne(id);
      const pdfBuffer = await this.pdfService.generatePDF(invoice);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=Invoice_${invoice.invoiceNumber}.pdf`,
        'Content-Length': pdfBuffer.length,
      });

      return pdfBuffer;
    } catch (error:unknown) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      throw new HttpException(
        {
          success: false,
          message: 'Error generating PDF',
          error: message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Send invoice via email
  @Post(':id/send-email')
  @ApiOperation({ summary: 'Send invoice PDF via email' })
  @ApiParam({
    name: 'id',
    description: 'Invoice ID',
    example: '66a7e8c5d8a4e234abcd1234',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Optional recipient email (defaults to buyer email)',
    example: 'customer@gmail.com',
  })
  @ApiResponse({ status: 200, description: 'Invoice sent successfully' })
  @ApiResponse({ status: 500, description: 'Error sending email' })
  async sendEmail(
    @Param('id') id: string,
    @Query('email') email?: string,
  ) {
    try {
      const invoice = await this.invoiceService.findOne(id);
      const pdfBuffer = await this.pdfService.generatePDF(invoice);

      // Use provided email or buyer's email from invoice
      const recipientEmail = email || invoice.buyerEmail;

      await this.emailService.sendInvoiceEmail(
        recipientEmail,
        invoice.invoiceNumber,
        pdfBuffer,
      );

      return {
        success: true,
        message: `Invoice sent successfully to ${recipientEmail}`,
      };
    } catch (error:unknown) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      return {
        success: false,
        message: 'Error sending email',
        error: message,
      };
    }
  }

  // Get WhatsApp share link
  @Get(':id/whatsapp-link')
  @ApiOperation({ summary: 'Generate WhatsApp invoice share link' })
  @ApiParam({
    name: 'id',
    description: 'Invoice ID',
    example: '66a7e8c5d8a4e234abcd1234',
  })
  @ApiResponse({ status: 200, description: 'WhatsApp link generated' })
  @ApiResponse({ status: 500, description: 'Error generating link' })
  async getWhatsAppLink(@Param('id') id: string) {
    try {
      const invoice = await this.invoiceService.findOne(id);
      
      // Create WhatsApp message
      const message = `Hi, Please find your invoice ${invoice.invoiceNumber}. Download link: ${process.env.APP_URL || 'http://localhost:4000'}/invoice/${id}/pdf`;
      
      // WhatsApp deep link
      const whatsappLink = `https://wa.me/${invoice.buyerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

      return {
        success: true,
        data: {
          whatsappLink,
          message,
        },
      };
    } catch (error:unknown) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      return {
        success: false,
        message: 'Error generating WhatsApp link',
        error: message,
      };
    }
  }

  // invoice.controller.ts
  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice details' })
  @ApiParam({
    name: 'id',
    description: 'Invoice ID',
    example: '66a7e8c5d8a4e234abcd1234',
  })
  @ApiBody({ type: UpdateInvoiceDto })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  async updateInvoice(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    const invoice = await this.invoiceService.update(id, dto);

    return {
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
    };
  }


  // Delete invoice
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.invoiceService.delete(id);
    return {
      success: true,
      message: 'Invoice deleted successfully',
    };
  }
}
