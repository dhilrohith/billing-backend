/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { Invoice } from '../invoice/schemas/invoice.schema';
import { generateInvoiceHTML } from './templates/invoice.template';

@Injectable()
export class PdfService {
  async generatePDF(invoice: Invoice): Promise<Buffer> {
    const html = generateInvoiceHTML(invoice);
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    for (const scale of [1.0, 0.97, 0.95, 0.93, 0.91, 0.89, 0.87, 0.85]) {
      await page.addStyleTag({ content: `
        :root { --invoice-scale: ${scale}; }
        body {
          transform: scale(var(--invoice-scale));
          transform-origin: top left;
          width: calc(210mm / var(--invoice-scale));
        }
      `});
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      // 273mm printable height ≈ 1031 CSS px at 96dpi
      if (height <= 1031) break;
    }

    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true, // respect the @page size/margins
      margin: { top: '0', right: '0', bottom: '0', left: '0' }, // margins handled in CSS
      scale: 1, // start at 1; see optional auto-fit below
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  }
}
