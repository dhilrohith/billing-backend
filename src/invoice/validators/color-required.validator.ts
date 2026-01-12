/* eslint-disable prettier/prettier */
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

interface ColorPayload {
  color?: unknown;
  customColor?: unknown;
}


@ValidatorConstraint({ name: 'ColorRequired', async: false })
export class ColorRequiredValidator
  implements ValidatorConstraintInterface
{
  validate(_: any, args: ValidationArguments) {
    const obj = args.object as ColorPayload;
    return !!(obj.color || obj.customColor);
  }

  defaultMessage() {
    return 'Either color or customColor must be provided';
  }
}
