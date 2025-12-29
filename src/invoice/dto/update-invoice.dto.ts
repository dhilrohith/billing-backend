/* eslint-disable prettier/prettier */
import { PartialType } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { CreateInvoiceDto } from "./create-invoice.dto";

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
    @IsOptional()
    @IsString()
    invoiceNumber?: string;
    
    @IsOptional()
    @IsString()
    date?: string;
}