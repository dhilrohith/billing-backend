/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BillType } from '../enums/bill-type.enum'
import { TSHIRT_SIZES } from 'src/common/constants/tshirtSizes';
import type { TshirtSize } from 'src/common/constants/tshirtSizes';

export type InvoiceDocument = Invoice & Document;

export enum UnitType {
  PCS = 'PCS',          // Pieces
  PERCENTAGE = '%',     // Percentage
}

export enum TshirtColor{
  R_BLUE = 'R_BLUE',
  S_BLUE = 'S_BLUE',
  GREY = 'GREY',
  NAVY = 'NAVY',
  BLACK = 'BLACK',
}

@Schema({_id: false})
class SizeQuantity {
  @Prop({ type: String, required: true, enum: TSHIRT_SIZES})
  size: TshirtSize;

  @Prop({ required: true, min:0 })
  quantity: number;
}

@Schema({_id: false})
class ColorBreakDown {
  @Prop({ required: false, enum: Object.values(TshirtColor) })
  color?: TshirtColor;

  @Prop({ type: String, required: false, trim: true,})
  customColor?: string;

  @Prop({ type: [SizeQuantity], required: true })
  sizes: SizeQuantity[];

  @Prop({ required: true, min:0 })
  totalQuantity: number;
}

@Schema({_id: false})
export class DescriptionDetails {
  @Prop({ required: true})
  productName: string;

  @Prop({ type: [ColorBreakDown], required: true})
  colorBreakDown: ColorBreakDown[];

  @Prop()
  finish: string
}
@Schema({_id: false})
class Quantity {
  @Prop({ required: true })
  shipped: number;

  @Prop({ required: true })
  billed: number;
}

@Schema({_id: false})
class InvoiceItem {
  @Prop({ type: DescriptionDetails, required: true })
  description: DescriptionDetails;

  @Prop({ required: true })
  hsnCode: string;

  @Prop({ type: Quantity, required: true })
  quantity: Quantity;

  @Prop({ 
    required: true, 
    enum: Object.values(UnitType),
    default: UnitType.PCS 
  })
  per: string;

  @Prop({ required: true })
  rate: number;

  @Prop({ required: true })
  amount: number;
}

@Schema({_id: false})
class Address {
  @Prop()
  street: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  pincode: string;
}

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: String, enum: Object.values(BillType), required: true })
  billType: BillType;

  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ required: true })
  month: string;

  @Prop({ required: true })
  year: string;

  @Prop({required: true})
  sequence: number;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, type: Date })
  dueDate: Date;

  // Shipping Details
  @Prop()
  shippingName: string;

  @Prop()
  shippingGstin: string;

  @Prop({ type: Address })
  shippingAddress: Address;

  @Prop()
  shippingPhone: string;

  @Prop()
  shippingEmail: string;

  // Buyer Details
  @Prop({ required: true })
  buyerName: string;

  @Prop({ required: true })
  buyerGstin: string;

  @Prop({ type: Address })
  buyerAddress: Address;

  @Prop()
  buyerPhone: string;

  @Prop()
  buyerEmail: string;

  // Items
  @Prop({ type: [InvoiceItem], required: true })
  items: InvoiceItem[];

  // Amounts
  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  cgst: number;

  @Prop({ default: 0 })
  sgst: number;

  @Prop({ default: 0 })
  igst: number;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  roundOff: number;

  @Prop()
  totalInWords: string;

  // Additional
  @Prop()
  notes: string;

  @Prop()
  termsAndConditions: string;

  @Prop()
  paymentMode: string;
} 
export const InvoiceSchema = SchemaFactory.createForClass(Invoice);