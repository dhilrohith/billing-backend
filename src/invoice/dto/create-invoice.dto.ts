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
  IsInt
} from 'class-validator';
import { Type } from 'class-transformer';
import { TshirtColor, TshirtSize, UnitType } from '../schemas/invoice.schema';
import { BillType } from '../enums/bill-type.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuantityDto {
  @ApiProperty({ example: 100 })
  @IsNumber()
  shipped: number;

  @ApiProperty({ example: 95 })
  @IsNumber()
  billed: number;
}

export class SizeQuantityDto {
  @ApiProperty({ enum: TshirtSize, example: TshirtSize.M })
  @IsEnum(TshirtSize)
  size: TshirtSize;

  @ApiProperty({ example: 10 })
  @IsInt()
  quantity: number;
}

export class ColorBreakDownDto {
  @ApiProperty({ enum: TshirtColor, example: TshirtColor.R_BLUE })
  @IsEnum(TshirtColor)
  color: TshirtColor;

  @ApiProperty({ type: [SizeQuantityDto] })
  @ValidateNested({ each: true })
  @Type(() => SizeQuantityDto)
  sizes: SizeQuantityDto[];

  @ApiProperty({ example: 25 })
  @IsInt()
  totalQuantity: number;
}

export class DescriptionDetailsDto {
  @ApiProperty({ example: 'MARS COLLAR T-SHIRT' })
  @IsString()
  productName: string;

  @ApiProperty({ type: [ColorBreakDownDto] })
  @ValidateNested({ each: true })
  @Type(() => ColorBreakDownDto)
  colorBreakDown: ColorBreakDownDto[];
}

export class InvoiceItemDto {
  @ApiProperty({ type: [DescriptionDetailsDto] })
  @ValidateNested({ each: true })
  @Type(() => DescriptionDetailsDto)
  description: DescriptionDetailsDto[];

  @ApiProperty({ example: '6109' })
  @IsString()
  hsnCode: string;

  @ApiProperty({ type: QuantityDto })
  @ValidateNested()
  @Type(() => QuantityDto)
  quantity: QuantityDto;

  @ApiProperty({
    enum: UnitType,
    example: UnitType.PCS,
    description: 'Unit type (PCS or %)',
  })
  @IsEnum(UnitType)
  per: UnitType;

  @ApiProperty({ example: 499 })
  @IsNumber()
  rate: number;
}

export class AddressDto {
  @ApiProperty({ example: '12, Gandhi Street' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Erode' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Tamil Nadu' })
  @IsString()
  state: string;

  @ApiProperty({ example: '638001' })
  @IsString()
  pincode: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ enum: BillType, example: BillType.INTRA_STATE })
  @IsEnum(BillType)
  billType: BillType;

  @ApiProperty({ example: '2025-01-31' })
  @IsDateString()
  dueDate: string;

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
  @ApiProperty({ example: 'DNS Clothing' })
  @IsString()
  buyerName: string;

  @ApiProperty({ example: '33ABCDE1234F1Z5' })
  @IsString()
  buyerGstin: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  buyerAddress: AddressDto;

  @ApiProperty({ example: '+91-9876543210' })
  @IsString()
  buyerPhone: string;

  @ApiPropertyOptional({ example: 'buyer@email.com' })
  @IsOptional()
  @IsEmail()
  buyerEmail?: string;

  // Items
  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
