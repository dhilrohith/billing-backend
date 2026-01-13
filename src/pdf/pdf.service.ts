/* eslint-disable prettier/prettier */
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
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
      ],
    });
  }
  return browser;
};

@Injectable()
export class PdfService implements OnModuleDestroy {

  async generatePDF(invoice: Invoice): Promise<Buffer> {
    const browser = await getBrowser();
    let page: Page | null = null;

    try {
      page = await browser.newPage();

      // 🔒 Prevent Puppeteer timeouts
      page.setDefaultTimeout(0);
      page.setDefaultNavigationTimeout(0);

      const html = generateInvoiceHTML(invoice);

      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
      });

      await page.emulateMediaType('print');

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
        scale: 1,
      });

      return Buffer.from(pdfBuffer);

    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;

    } finally {
      // ✅ Close page ONLY after PDF is done
      if (page && !page.isClosed()) {
        await page.close().catch(() => {});
      }
    }
  }

  // 🔥 Close browser gracefully on app shutdown
  async onModuleDestroy() {
    if (browser) {
      await browser.close().catch(() => {});
      browser = null;
    }
  }
}
