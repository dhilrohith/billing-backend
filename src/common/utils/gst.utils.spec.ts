/* eslint-disable prettier/prettier */
import { calculateGST } from './gst.utils';
import { BillType } from 'src/invoice/enums/bill-type.enum';

describe('calculateGST()', () => {

  describe('INTRA-STATE GST (CGST + SGST)', () => {
    it('should calculate CGST and SGST correctly', () => {
      const subtotal = 1000;

      const result = calculateGST(subtotal, BillType.INTRA_STATE);

      expect(result.cgst).toBeCloseTo(25); // 2.5%
      expect(result.sgst).toBeCloseTo(25); // 2.5%
      expect(result.igst).toBe(0);

      expect(result.totalTax).toBeCloseTo(50);
      expect(result.rawTotal).toBeCloseTo(1050);
      expect(result.finalTotal).toBe(1050);
      expect(result.roundOff).toBeCloseTo(0);
    });
  });

  describe('INTER-STATE GST (IGST only)', () => {
    it('should calculate IGST correctly', () => {
      const subtotal = 1000;

      const result = calculateGST(subtotal, BillType.INTER_STATE);

      expect(result.cgst).toBe(0);
      expect(result.sgst).toBe(0);
      expect(result.igst).toBeCloseTo(50); // 5%

      expect(result.totalTax).toBeCloseTo(50);
      expect(result.rawTotal).toBeCloseTo(1050);
      expect(result.finalTotal).toBe(1050);
      expect(result.roundOff).toBeCloseTo(0);
    });
  });

  describe('ROUND-OFF handling', () => {
    it('should calculate round-off correctly when decimal occurs', () => {
      const subtotal = 999.99;

      const result = calculateGST(subtotal, BillType.INTRA_STATE);

      expect(result.cgst).toBeCloseTo(25.00, 2);
      expect(result.sgst).toBeCloseTo(25.00, 2);
      expect(result.igst).toBe(0);

      expect(result.totalTax).toBeCloseTo(50.00, 2);
      expect(result.rawTotal).toBeCloseTo(1049.99, 2);

      expect(result.finalTotal).toBe(1050);
      expect(result.roundOff).toBeCloseTo(0.01, 2);
    });
  });

});
