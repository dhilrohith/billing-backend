/* eslint-disable prettier/prettier */
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from "class-validator";
import { TshirtColor } from "../schemas/invoice.schema";
import { Type } from "class-transformer";
import { SizeQuantityDto } from "./create-invoice.dto";

export class UpdateColorBreakDownDto {
  @IsOptional()
  @IsEnum(TshirtColor)
  color?: TshirtColor;

  @IsOptional()
  @IsString()
  @MinLength(1)
  customColor?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeQuantityDto)
  sizes?: SizeQuantityDto[];

  @IsOptional()
  @IsInt()
  @Min(0)
  totalQuantity?: number;
}
