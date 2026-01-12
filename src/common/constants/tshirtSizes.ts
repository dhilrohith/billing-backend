/* eslint-disable prettier/prettier */
export const TSHIRT_SIZES = [
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  '5XL',
  '6XL',
  '7XL',
  '8XL',
  '9XL',
  '10XL',
  '11XL',
  '12XL',
] as const;

//Type derived from values (compile-time safety)
export type TshirtSize = (typeof TSHIRT_SIZES)[number];

// numeric priority (sorting, pricing, logic)
export const SIZE_PRIORITY: Record<TshirtSize, number> =
  TSHIRT_SIZES.reduce((acc, size, index) => {
    acc[size] = index + 1;
    return acc;
  }, {} as Record<TshirtSize, number>);
