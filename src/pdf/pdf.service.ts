/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { Invoice } from '../invoice/schemas/invoice.schema';
import { generateInvoiceHTML } from './templates/invoice-pdf.template';

let browser: Browser | null = null;

export const getBrowser = async (): Promise<Browser> => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote',
        '--single-process'
      ],
    });
  }
  return browser;
};

@Injectable()
export class PdfService {
  async generatePDF(invoice: Invoice): Promise<Buffer> {
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
      const html = generateInvoiceHTML(invoice);

      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await page.emulateMediaType('print');

      const pdfBuffer = await page.pdf({
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        scale: 1,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close(); // 👈 IMPORTANT
    }
  }
}
