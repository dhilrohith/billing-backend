/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ToWords } from 'to-words';
import { calculateGST } from '../common/utils/gst.utils';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoiceService {
  private toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        name: 'Rupee',
        plural: 'Rupees',
        symbol: '₹',
        fractionalUnit: {
          name: 'Paise',
          plural: 'Paise',
          symbol: '',
        },
      },
    },
  });

  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async generateInvoiceNumber(){
    const d = new Date();

    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year =  String(d.getFullYear()).slice(-2);

    const date = `${day}-${month}-${String(d.getFullYear())}`;

    const lastInvoice = await this.invoiceModel
      .findOne({month, year})
      .sort({ sequence: -1 })
      .select('sequence')

    const num = lastInvoice ? lastInvoice.sequence + 1 : 1;
    const formattedNum = String(num).padStart(2, '0');

    const invoiceNumber = `INV-${month}-${year}-${formattedNum}`;

    return {
      invoiceNumber,
      month,
      year,
      sequence:num,
      date,
    }
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {

    const {invoiceNumber, month, year, sequence, date} = await this.generateInvoiceNumber();
    // 1. Calculate item amounts and subtotal
    let subtotal = 0;
    const items = createInvoiceDto.items.map((item) => {
      const amount = item.rate * item.quantity.billed;
      subtotal += amount;
      return {
        ...item,
        amount, // Auto-calculated
      };
    });

    const gst = calculateGST(subtotal, createInvoiceDto.billType);

    // 4. Generate amount in words
    const totalInWords = this.toWords.convert(gst.finalTotal);

    const invoiceData = {
      ...createInvoiceDto,
      invoiceNumber,
      month,
      year,
      sequence,
      date,
      items,
      subtotal,
      cgst: gst.cgst,
      sgst: gst.sgst,
      igst: gst.igst,
      total: gst.finalTotal,
      roundOff: gst.roundOff,
      totalInWords,
    };

    const createdInvoice = new this.invoiceModel(invoiceData);
    return createdInvoice.save();
  }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceModel.find().exec();
  }

  async findOne(id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return invoice;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findOne({ invoiceNumber }).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceNumber} not found`);
    }
    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.findOne(id);

    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) {
        invoice.set(key, value);
      }
    }

    return invoice.save();
  }

  async delete(id: string): Promise<void> {
    const result = await this.invoiceModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
  }
}