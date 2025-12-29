/* eslint-disable prettier/prettier */
import { Invoice } from '../../invoice/schemas/invoice.schema';
import { COMPANY_PROFILE } from '../../config/company.config';
import * as path from 'path';
import * as fs from 'fs';
import { DescriptionDetails } from '../../invoice/schemas/invoice.schema';

const seller = COMPANY_PROFILE.seller;
const bank = COMPANY_PROFILE.bank;
const signatory = COMPANY_PROFILE.authorizedSignatory;
const extras = COMPANY_PROFILE.extras;

// Helper function to convert image to base64
export const imageToBase64 = (filePath: string): string => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(filePath).slice(1); // Get extension without dot
    return `data:image/${ext};base64,${base64Image}`;
  } catch (error) {
    console.error('Error reading image:', error);
    return '';
  }
};

export const descriptionHTML = (desc: DescriptionDetails): string => { return`
  <strong>${desc.productName}</strong><br/>

  ${desc.colorBreakDown.map(color => `
    <div style="margin-top: 1mm;">
      <strong>${color.color}:</strong>
      ${color.sizes
        .map(s => `${s.size}-${s.quantity}`)
        .join(', ')
      }
      = ${color.totalQuantity} PCS
    </div>
  `).join('')}
`};

export const formatTextToLines = (text?: string): string => {
  if (!text) return '';

  return text
    .split('.')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<li>${line}.<//li>`)
    .join('');
};


export const generateInvoiceHTML = (invoice: Invoice): string => {
  // Convert logo to base64
  const logoPath = path.join(process.cwd(), 'public', 'images', 'brand_logo.png');
  const logoBase64 = imageToBase64(logoPath);

  const signaturePath = path.join(process.cwd(), 'public', 'images', signatory.signatureImage || 'signature.jpg');
  const signBase64 = imageToBase64(signaturePath);

  const itemsRows = invoice.items
    .map(
      (item, index) => `
      <tr>
        <td class="c c-num">${index + 1}</td>
        <td class="c c-desc">${descriptionHTML(item.description)}</td>
        <td class="c c-hsn">${item.hsnCode}</td>
        <td class="c c-qty">${item.quantity.shipped}</td>
        <td class="c c-qty">${item.quantity.billed}</td>
        <td class="c c-unit">${item.per}</td>
        <td class="c c-money">₹${item.rate.toFixed(2)}</td>
        <td class="c c-money">₹${item.amount.toFixed(2)}</td>
      </tr>
    `,
    )
    .join('');

  // Optional blocks built safely
  const consigneeBlock = invoice.shippingAddress || invoice.buyerAddress
    ? `
    <div class="section">
      <div class="section-title">Consignee (Ship to)</div>
      <div class="section-content">
        <div class="info-row"><span class="info-label">Name:</span> ${invoice.shippingName || invoice.buyerName}</div>
        <div class="info-row"><span class="info-label">GSTIN:</span> ${invoice.shippingGstin || invoice.buyerGstin}</div>
        <div class="info-row">
          <span class="info-label">Address:</span>
          ${invoice.shippingAddress?.street || invoice.buyerAddress?.street || ''},
          ${invoice.shippingAddress?.city || invoice.buyerAddress?.city || ''},
          ${invoice.shippingAddress?.state || invoice.buyerAddress?.state || ''} -
          ${invoice.shippingAddress?.pincode || invoice.buyerAddress?.pincode || ''}
        </div>
        <div class="info-row"><span class="info-label">Phone:</span> ${invoice.shippingPhone || invoice.buyerPhone || ''}</div>
        ${invoice.shippingEmail || invoice.buyerEmail ? `<div class="info-row"><span class="info-label">Email:</span> ${invoice.shippingEmail || invoice.buyerEmail || ''}</div>`: ''}
      </div>
    </div>
  `
    : '';

  const bankBlock = bank
    ? `
    <div class="section narrow bank">
      <div class="section-title">Bank Details</div>
      <div class="section-content">
        <div class="info-row"><span class="info-label">Bank:</span> ${bank.name}</div>
        <div class="info-row"><span class="info-label">A/C No:</span> ${bank.accountNumber || ''}</div>
        <div class="info-row"><span class="info-label">IFSC:</span> ${bank.ifsc || ''}</div>
        ${bank.branch ? `<div class="info-row"><span class="info-label">Branch:</span> ${bank.branch}</div>` : ''}
      </div>
    </div>
  `
    : '';

  const notesTermsBlock =
    (extras.notes || extras.termsAndConditions) ? `
    <div class="section narrow notes-terms clamp-4">
      <div class="section-title">Notes / Terms</div>
      <div class="section-content notes-terms-flex">
        ${extras.notes ? `<div class="notes-box" ><p class="nt-title">Notes</p><ul>${formatTextToLines(extras.notes)}</ul></div>` : ''}
        <div class="notes-terms-divider"></div>
        ${extras.termsAndConditions ? `<div class="terms-box"><p class="nt-title">Terms & Conditions</p><ul>${formatTextToLines(extras.termsAndConditions)}</ul></div>` : ''}
      </div>
    </div>
  ` : '';


  const amountInWordsBlock = invoice.totalInWords ? `
    <div class="chip amount-words">
      <strong>Amount in Words:</strong>
      <span class="amount-text" style="text-transform: uppercase;">
        ${invoice.totalInWords}
      </span>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tax Invoice</title>
  <style>
    /* =================== PAGE & SIZING (A4) =================== */
    @page {
      size: A4;             /* 210mm x 297mm */
      margin: 10mm 12mm;         /* control final printable area here */
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 210mm;
      min-height: 297mm;
      font-family: Arial, Helvetica, sans-serif;
      color: #333;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Printable */
    .invoice-box {
      width: 100%;
      height: auto;
      margin: 0 auto;
      padding: 0;
      box-sizing: border-box;
      overflow: hidden;           /* avoid accidental spill */
    }

    /* =================== TYPOGRAPHY & SPACING =================== */
    .header {
      display: flex;
      justify-content: center;
      margin-bottom: 4mm;
    } 
    .header h1 {
      font-size: 18px;            /* compact */
      margin: 0;
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2mm;
      margin-bottom: 2mm;
    }

    .header-left { 
      flex: 1 1 0; 
      min-width:0; 
    }

    .header-right { 
      border: 1px solid #e3e3e3;
      flex: 0 0 80mm; 
      display: flex;
      flex-direction: column; 
    }

    .invoice-info { 
      box-sizing: border-box;
      padding: 4mm;
      background-color: #f8f9fa;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      gap: 1mm;
    }
    
    .invoice-info p { 
      margin: 0;
      padding: 0;
      line-height: 1.3;  
      font-size: 16px; 
    }

    .logo-container {
      display: flex;
      justify-content: center;      
      align-items: center;        
    }

    .logo-container img { 
      max-width: 60mm;              
      height: auto;
      margin-bottom: 4mm;
    }

    .section { margin-bottom: 2mm; }

    .section-title {
      background-color: #F4B8A7;
      color: #101010ff;
      padding: 1mm 2mm;
      font-size: 10.5px;
      font-weight: bold;
    }
    .section-content {
      border: 1px solid #e3e3e3;
      border-top: none;
      padding: 0.5mm;
      font-size: 10.5px;
      line-height: 1.15;
    }

    .info-row { 
      margin-bottom: 2mm; 
    }
    .info-label { 
      font-weight: bold; 
      display: inline-block; 
      width: 32mm; 
    }

    /* =================== TABLE =================== */
    table { 
      width: 100%; 
      border-collapse: collapse; 
      table-layout: fixed; 
    }

    th, td { 
      border: 1px solid #e3e3e3;
      padding: 2mm;
      font-size: 10.5px;
      line-height:1.15;
    }

    th {
      background-color: #F4B8A7;
      color: #101010ff;
      text-align: left;
    }

    /* Column widths */
    td.c-num   { width: 10mm; text-align: center; }
    td.c-hsn   { width: 20mm; text-align: center; }
    td.c-qty   { width: 16mm; text-align: center; }
    td.c-unit  { width: 14mm; text-align: center; }
    td.c-money { width: 20mm; text-align: right; }
    td.c-desc  {
      white-space: normal;
      overflow-wrap: anywhere;
    }

    /* =================== TOTALS =================== */
    .payment-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 4mm;
      margin-top: 6mm;

      break-inside: avoid;
      page-break-inside: avoid;
    }
 
    .totals-wrap {
      border: 1px solid #e3e3e3;
    }

    .totals-wrap table { 
      width: 100%;
      border-collapse: collapse; 
    }
    .totals-wrap td {
      border: 1px solid #e3e3e3;
      padding: 2.25mm; 
      font-size: 12px; 
    }
    .total-row { 
      font-weight: bold; 
      font-size: 14px; 
      background-color: #ecf0f1; 
    }

    /* Bank under totals */
    .bank-wrap {
      flex: 1 1 auto;
      max-width: 95mm;
    }

    .bank-wrap .section {
      margin-bottom: 0;
    }

    .totals-wrap {
      flex: 0 0 70mm;
      border: 1px solid #e3e3e3;
    }

    /* After-totals: 2-column compact grid */
    .after-totals {
      display: grid;
      grid-template-columns: 1fr 1fr;   /* two equal columns */
      gap: 3mm;
      margin-top: 3mm;

      break-inside: auto;
      page-break-inside: auto;
    }
    
    /* Compact sections */
    .section.narrow .section-title {
      font-size: 11px;
      padding: 2mm 2.5mm;
    }

    .section.narrow .section-content {
      font-size: 11px;
      padding: 2mm 2.5mm;
    }

    .amount-words {
      grid-column: 1 / 2;
    }

    .amount-words .amount-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .notes-terms {
      grid-column: 1 / -1;
      line-height: 1.2;
    }

    .notes-terms .section-content {
      padding-top: 1mm;   /* reduce top space */
      padding-bottom: 2mm;
    }


    .notes-terms-flex {
      display: flex;
      gap: 1mm;
      align-items: stretch;
    }

    .notes-box,
    .terms-box {
      flex: 1 1 0;
      padding: 0 3mm;
      min-width: 0; /* very important for PDF overflow */
    }

    .nt-title {
      font-weight: bold;
      margin-bottom: 0.5mm;
      font-size: 11px;
    }

    .notes-terms .nt-title {
      margin-top: 0;      /* IMPORTANT */
      margin-bottom: 1mm;
    }

    .notes-terms-divider {
      width: 0;
      border-left: 1px solid rgba(14, 14, 14, 0.2);
    }

    .signature {
      margin-top: 1.5mm;
      display: flex;
      justify-content: flex-end; /* push block to right */
    }

    .signature-box {
      width: 45mm;              /* same visual width as signature image */
      display: flex;
      flex-direction: column;
      align-items: flex-start;  /* ALL start from same vertical line */
    }

    .signature-box img {
      max-width: 45mm;
      height: auto;
      margin: 1mm 0;
    }

    .signature-box p {
      margin: 0;
      font-size: 16px;
    }
    .for-text span, .role-text {
      font-weight: bold;
      align-self: flex-end;
    }
    /* =================== PRINT SAFEGUARDS =================== */
    @media print {
      .invoice-box { overflow: hidden; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <!-- Header -->
    <div class="header">
      <h1>TAX INVOICE</h1>
    </div>

    <div class="header-container">
      <!-- Left: Seller, Consignee, Buyer -->
      <div class="header-left">
        <!-- Seller -->
        <div class="section">
          <div class="section-title">Seller Details</div>
          <div class="section-content">
            <div class="info-row"><span class="info-label">Name:</span> ${seller.name}</div>
            <div class="info-row"><span class="info-label">GSTIN:</span> ${seller.gstin}</div>
            <div class="info-row"><span class="info-label">Address:</span> ${seller.address.street}, ${seller.address.city}, ${seller.address.state} - ${seller.address.pincode}</div>
            ${seller.phone ? `<div class="info-row"><span class="info-label">Phone:</span> ${seller.phone}</div>` : ''}
            ${seller.email ? `<div class="info-row"><span class="info-label">Email:</span> ${seller.email}</div>` : ''}
          </div>
        </div>

        ${consigneeBlock}

        <!-- Buyer -->
        <div class="section">
          <div class="section-title">Buyer (Bill to)</div>
          <div class="section-content">
            <div class="info-row"><span class="info-label">Name:</span> ${invoice.buyerName}</div>
            <div class="info-row"><span class="info-label">GSTIN:</span> ${invoice.buyerGstin}</div>
            <div class="info-row"><span class="info-label">Address:</span> ${invoice.buyerAddress.street}, ${invoice.buyerAddress.city}, ${invoice.buyerAddress.state} - ${invoice.buyerAddress.pincode}</div>
            <div class="info-row"><span class="info-label">Phone:</span> ${invoice.buyerPhone}</div>
            ${invoice.buyerEmail ? `<div class="info-row"><span class="info-label">Email:</span> ${invoice.buyerEmail}</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Right: Logo + Invoice meta -->
      <div class="header-right">
        <div class="invoice-info">
          <div class="logo-container">
            ${logoBase64 ? `<img src="${logoBase64}" alt="Company Logo">` : ''}
          </div>
          <p><strong>Invoice No:</strong></p>
          <p style="margin-bottom: 3mm;">${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong></p>
          <p>${invoice.date}</p>
          <p><strong>Due:</strong></p>
          <p>${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
        </div>
      </div>
    </div>
 
    <!-- Items -->
    <div class="section">
      <div class="section-title">Item Details</div>
      <div class="section-content" style="border-top:1px solid #e3e3e3;">
        <table>
          <colgroup>
            <col style="width:10mm">   <!-- S.No -->
            <col>                      <!-- Description (flex / remaining) -->
            <col style="width:20mm">   <!-- HSN -->
            <col style="width:16mm">   <!-- Qty Shp -->
            <col style="width:16mm">   <!-- Qty Bil -->
            <col style="width:14mm">   <!-- Unit -->
            <col style="width:20mm">   <!-- Rate -->
            <col style="width:24mm">   <!-- Amount -->
          </colgroup>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Description</th>
              <th>HSN/SAC</th>
              <th>Qty Shp</th>
              <th>Qty Bil</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Totals -->
    <div class="payment-row">

      <div class="bank-wrap">
        ${bankBlock}
      </div>

      <div class="totals-wrap">
        <table>
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">₹${invoice.subtotal}</td>
          </tr>
          <tr><td>CGST (2.5%):</td><td style="text-align:right;">₹${invoice.cgst}</td></tr> 
          <tr><td>SGST (2.5%):</td><td style="text-align:right;">₹${invoice.sgst}</td></tr> 
          <tr><td>IGST (5%):</td><td style="text-align:right;">₹${invoice.igst}</td></tr>
          <tr>
            <td>Round Off:</td>
            <td style="text-align:right;">₹${invoice.roundOff}</td>
          </tr>
          <tr class="total-row">
            <td>Total:</td>
            <td style="text-align: right;">₹${invoice.total}</td>
          </tr>
        </table>
      </div>
    
    </div>
    
    <div class="after-totals">
      ${amountInWordsBlock}
      ${notesTermsBlock}
    </div>
    
    <!-- Signature -->
    <div class="signature">
      <div class="signature-box">
        <p class="for-text">For <span>DNS CLOTHING</span></p>
        <img src="${signBase64}" alt="Signature">
        <p class="role-text">Proprietor</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};