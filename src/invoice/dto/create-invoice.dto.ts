/* eslint-disable prettier/prettier */
import { 
  IsString, 
  IsEmail, 
  IsArray, 
  IsNumber, 
  IsDateString, 
  ValidateNested, 
  IsOptional, 
  IsEnum, 
  IsInt,
  IsIn,
  MinLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { TshirtColor, UnitType } from '../schemas/invoice.schema';
import { BillType } from '../enums/bill-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TSHIRT_SIZES } from 'src/common/constants/tshirtSizes';
import type { TshirtSize } from 'src/common/constants/tshirtSizes';

export class QuantityDto {
  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  shipped?: number;

  @ApiPropertyOptional({ example: 95 })
  @IsOptional()
  @IsNumber()
  billed?: number;
}

export class SizeQuantityDto {
  @ApiPropertyOptional({ enum: TSHIRT_SIZES, example: 'M' })
  @IsOptional()
  @IsIn(TSHIRT_SIZES)
  size?: TshirtSize;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  quantity?: number;
}

export class ColorBreakDownDto {
  @ApiPropertyOptional({ enum: TshirtColor, example: TshirtColor.R_BLUE, description: 'Predefined t-shirt color', })
  @IsOptional()
  @IsEnum(TshirtColor)
  color?: TshirtColor;

  @ApiPropertyOptional({
    example: 'Maroon',
    description: 'Custom color if not selecting predefined color',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  customColor?: string;

  @ApiPropertyOptional({ type: [SizeQuantityDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SizeQuantityDto)
  sizes?: SizeQuantityDto[];

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsInt()
  totalQuantity?: number;
}

export class DescriptionDetailsDto {
  @ApiPropertyOptional({ example: 'MARS COLLAR T-SHIRT' })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiPropertyOptional({ type: [ColorBreakDownDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ColorBreakDownDto)
  colorBreakDown?: ColorBreakDownDto[];
}

export class InvoiceItemDto {
  @ApiPropertyOptional({ type: DescriptionDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DescriptionDetailsDto)
  description?: DescriptionDetailsDto;

  @ApiPropertyOptional({ example: '6109' })
  @IsOptional()
  @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ type: QuantityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuantityDto)
  quantity?: QuantityDto;

  @ApiPropertyOptional({
    enum: UnitType,
    example: UnitType.PCS,
    description: 'Unit type (PCS or %)',
  })
  @IsOptional()
  @IsEnum(UnitType)
  per?: UnitType;

  @ApiPropertyOptional({ example: 499 })
  @IsOptional()
  @IsNumber()
  rate?: number;
}

export class AddressDto {
  @ApiPropertyOptional({ example: '12, Gandhi Street' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ example: 'Erode' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Tamil Nadu' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '638001' })
  @IsOptional()
  @IsString()
  pincode?: string;
}

export class CreateInvoiceDto {
  @ApiPropertyOptional({ example: 'INV-MANUAL-001' })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @ApiPropertyOptional({ enum: BillType, example: BillType.INTRA_STATE })
  @IsOptional()
  @IsEnum(BillType)
  billType?: BillType;

  @ApiPropertyOptional({ example: '2025-01-31' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  // Shipping
  @ApiPropertyOptional({ example: 'XYZ Warehouse' })
  @IsOptional()
  @IsString()
  shippingName?: string;

  @ApiPropertyOptional({ example: '33ABCDE1234F1Z5' })
  @IsOptional()
  @IsString()
  shippingGstin?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress?: AddressDto;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @ApiPropertyOptional({ example: 'warehouse@email.com' })
  @IsOptional()
  @IsEmail()
  shippingEmail?: string;

  // Buyer
  @ApiPropertyOptional({ example: 'DNS Clothing' })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiPropertyOptional({ example: '33ABCDE1234F1Z5' })
  @IsOptional()
  @IsString()
  buyerGstin?: string;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  buyerAddress?: AddressDto;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  buyerPhone?: string;

  @ApiPropertyOptional({ example: 'buyer@email.com' })
  @IsOptional()
  @IsEmail()
  buyerEmail?: string;

  // Items
  @ApiPropertyOptional({ type: [InvoiceItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];

  @ApiPropertyOptional({ example: 'Payment due within 30 days' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'Goods once sold cannot be returned' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ example: 'UPI' })
  @IsOptional()
  @IsString()
  paymentMode?: string;
}
