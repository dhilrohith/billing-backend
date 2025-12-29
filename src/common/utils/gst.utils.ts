/* eslint-disable prettier/prettier */
import { BillType } from "src/invoice/enums/bill-type.enum";

export interface GSTResult {
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  rawTotal: number;
  roundOff: number;
  finalTotal: number;
}

export function calculateGST(
  subtotal: number,
  billType: BillType,
): GSTResult {
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  if (billType === BillType.INTER_STATE) {
    igst = round2(subtotal * 0.05);
  } else {
    cgst = round2(subtotal * 0.025);
    sgst = round2(subtotal * 0.025);
  }

  const totalTax = round2(cgst + sgst + igst);
  const rawTotal = round2(subtotal + totalTax);
  const finalTotal = Math.round(rawTotal);
  const roundOff = round2(finalTotal - rawTotal);

  return {
    cgst,
    sgst,
    igst,
    totalTax,
    rawTotal,
    roundOff,
    finalTotal,
  };
}
