import PDFDocument from 'pdfkit';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Helper to fetch image buffer for PDF kit
async function getImageBuffer(imgUrl) {
  if (!imgUrl) return null;
  try {
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
      const response = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 5000 });
      return Buffer.from(response.data);
    }
    
    // Clean relative path like /uploads/123.jpg
    let cleanPath = imgUrl.startsWith('/') ? imgUrl.slice(1) : imgUrl;
    let localPath = path.resolve(cleanPath);
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
    
    let uploadPath = path.resolve('uploads', path.basename(cleanPath));
    if (fs.existsSync(uploadPath)) {
      return fs.readFileSync(uploadPath);
    }
  } catch (err) {
    console.error(`PDF Image fetch warning (${imgUrl}):`, err.message);
  }
  return null;
}

export const generateOrderInvoicePdf = async (order, res) => {
  // Use margin: 25 to ensure all sections stay neatly within 1 single A4 page
  const doc = new PDFDocument({ margin: 25, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="Invoice-${order.orderNumber}.pdf"`);

  doc.pipe(res);

  // Styling Constants
  const goldColor = '#996515';
  const darkOnyx = '#111111';
  const grayText = '#555555';

  // --- 1. HEADER SECTION ---
  doc.rect(0, 0, doc.page.width, 80).fill('#111111');
  
  doc.fillColor('#D4AF37').fontSize(18).font('Helvetica-Bold').text('AURELIA', 35, 20);
  doc.fillColor('#CCCCCC').fontSize(8).font('Helvetica').text('FINE PIERCING JEWELRY & STUDIO SUPPLIES', 35, 42);

  doc.fillColor('#FFFFFF').fontSize(13).font('Helvetica-Bold').text('OFFICIAL TAX INVOICE', 350, 20, { align: 'right' });
  doc.fillColor('#D4AF37').fontSize(9).font('Helvetica').text(`Invoice #: ${order.orderNumber}`, 350, 38, { align: 'right' });
  doc.fillColor('#CCCCCC').fontSize(8).font('Helvetica').text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 52, { align: 'right' });

  let y = 92;

  // --- 2. METADATA & CUSTOMER INFO BOXES ---
  // Box 1: Customer & Shipping Address
  doc.rect(35, y, 255, 92).fillAndStroke('#FDFCF7', '#E5D3B3');
  doc.fillColor(goldColor).fontSize(9).font('Helvetica-Bold').text('BILLED TO & SHIPPING ADDRESS', 45, y + 8);
  
  const ship = typeof order.shippingAddress === 'string' 
    ? JSON.parse(order.shippingAddress || '{}') 
    : (order.shippingAddress || {});
  const user = order.user || {};

  doc.fillColor(darkOnyx).fontSize(8.5).font('Helvetica-Bold').text(ship.fullName || user.name || 'Valued Customer', 45, y + 22);
  doc.fillColor(grayText).fontSize(7.5).font('Helvetica')
    .text(`${ship.addressLine1 || ''} ${ship.addressLine2 || ''}`, 45, y + 34, { width: 235 })
    .text(`${ship.city || ''}, ${ship.state || ''} ${ship.postalCode || ''}, ${ship.country || 'India'}`, 45, y + 48, { width: 235 })
    .text(`Email: ${ship.email || user.email || 'N/A'}`, 45, y + 62)
    .text(`Phone: ${ship.phone || user.phone || 'N/A'}`, 45, y + 74);

  // Box 2: Order Status & Audit Summary
  doc.rect(305, y, 255, 92).fillAndStroke('#F8F9FA', '#E0E0E0');
  doc.fillColor(darkOnyx).fontSize(9).font('Helvetica-Bold').text('ORDER SUMMARY & STATUS', 315, y + 8);
  
  doc.fillColor(grayText).fontSize(7.5).font('Helvetica')
    .text(`Platform Scope: ${order.platform || 'RETAIL'} Platform`, 315, y + 24)
    .text(`Payment Status: ${order.paymentStatus || 'PAID'}`, 315, y + 38)
    .text(`Order Fulfillment: ${order.orderStatus || 'PENDING'}`, 315, y + 52);

  if (user.role === 'B2B_CUSTOMER' || user.companyName) {
    doc.fillColor(goldColor).text(`B2B Company: ${user.companyName || 'Wholesale Member'}`, 315, y + 66);
    doc.fillColor(grayText).text(`GSTIN: ${user.gstNumber || 'N/A'}`, 315, y + 78);
  } else {
    doc.fillColor(goldColor).text(`Return Policy Accepted: Yes (v${order.policyVersion || '1.0'})`, 315, y + 66);
    doc.fillColor(grayText).text(`Acceptance Record: ${new Date(order.policyAcceptedAt || order.createdAt).toLocaleString()}`, 315, y + 78);
  }

  y += 102;

  // --- 3. PRODUCTS TABLE HEADER ---
  doc.rect(35, y, 525, 20).fill('#111111');
  doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
  doc.text('#', 40, y + 6);
  doc.text('IMAGE', 60, y + 6);
  doc.text('PRODUCT DETAILS & SKU', 125, y + 6);
  doc.text('QTY', 375, y + 6, { width: 30, align: 'center' });
  doc.text('PRICE', 415, y + 6, { width: 65, align: 'right' });
  doc.text('TOTAL', 485, y + 6, { width: 68, align: 'right' });

  y += 22;

  // Pre-fetch all product images
  const items = order.items || [];
  const imageBuffers = await Promise.all(
    items.map(async (item) => {
      let url = item.image;
      if (!url && item.product && item.product.images && item.product.images.length > 0) {
        url = item.product.images[0].imageUrl;
      }
      return await getImageBuffer(url);
    })
  );

  // --- 4. ITEM ROWS ---
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const imgBuf = imageBuffers[i];
    const rowHeight = 38;

    // Alternate background row tint
    if (i % 2 === 0) {
      doc.rect(35, y, 525, rowHeight).fill('#FBFBFA');
    } else {
      doc.rect(35, y, 525, rowHeight).fill('#FFFFFF');
    }

    doc.fillColor(darkOnyx).fontSize(8).font('Helvetica').text(`${i + 1}`, 40, y + 14);

    // Draw embedded product image
    if (imgBuf) {
      try {
        doc.image(imgBuf, 62, y + 3, { fit: [32, 32], align: 'center', valign: 'center' });
      } catch (err) {
        doc.rect(62, y + 3, 32, 32).fillAndStroke('#EEEEEE', '#CCCCCC');
        doc.fillColor('#999999').fontSize(5.5).text('No Image', 64, y + 15);
      }
    } else {
      doc.rect(62, y + 3, 32, 32).fillAndStroke('#F5F5F5', '#DDDDDD');
      doc.fillColor('#AAAAAA').fontSize(5.5).text('Jewelry', 65, y + 15);
    }

    // Product Title & Details
    doc.fillColor(darkOnyx).fontSize(8).font('Helvetica-Bold').text(item.productName || 'Piercing Product', 125, y + 6, { width: 235, height: 12 });
    doc.fillColor(grayText).fontSize(7).font('Helvetica').text(`SKU: ${item.productSku || 'N/A'} ${item.variantName ? `| ${item.variantName}` : ''}`, 125, y + 20, { width: 235 });

    // Qty, Price, Total
    doc.fillColor(darkOnyx).fontSize(8).font('Helvetica').text(`${item.quantity}`, 375, y + 14, { width: 30, align: 'center' });
    doc.text(`INR ${item.unitPrice ? item.unitPrice.toFixed(2) : '0.00'}`, 415, y + 14, { width: 65, align: 'right' });
    doc.fillColor(darkOnyx).font('Helvetica-Bold').text(`INR ${item.totalPrice ? item.totalPrice.toFixed(2) : '0.00'}`, 485, y + 14, { width: 68, align: 'right' });

    y += rowHeight + 2;

    // Page overflow check (if order has many items)
    if (y > 680 && i < items.length - 1) {
      doc.addPage();
      y = 35;
    }
  }

  y += 8;

  // --- 5. FINANCIAL TOTALS SUMMARY ---
  const totalsY = y;
  doc.rect(345, totalsY, 215, 78).fillAndStroke('#FDFCF7', '#E5D3B3');

  doc.fillColor(grayText).fontSize(7.5).font('Helvetica');
  doc.text('Items Subtotal:', 355, totalsY + 8);
  doc.fillColor(darkOnyx).text(`INR ${order.subtotal ? order.subtotal.toFixed(2) : '0.00'}`, 465, totalsY + 8, { align: 'right', width: 85 });

  doc.fillColor(grayText).text('Tax (3% GST):', 355, totalsY + 20);
  doc.fillColor(darkOnyx).text(`INR ${order.tax ? order.tax.toFixed(2) : '0.00'}`, 465, totalsY + 20, { align: 'right', width: 85 });

  doc.fillColor(grayText).text('Shipping Charge:', 355, totalsY + 32);
  doc.fillColor(darkOnyx).text(order.shippingCharge === 0 ? 'FREE' : `INR ${order.shippingCharge ? order.shippingCharge.toFixed(2) : '0.00'}`, 465, totalsY + 32, { align: 'right', width: 85 });

  doc.rect(345, totalsY + 48, 215, 30).fill(goldColor);
  doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('FINAL PAYABLE AMOUNT:', 355, totalsY + 57);
  doc.fontSize(9.5).text(`INR ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}`, 455, totalsY + 56, { align: 'right', width: 95 });

  y = totalsY + 88;

  // --- 6. STRICT NO RETURN POLICY AUDIT FOOTER ---
  doc.rect(35, y, 525, 40).fillAndStroke('#FFF9F0', '#F0C987');
  doc.fillColor('#996515').fontSize(7.5).font('Helvetica-Bold').text('STRICT NO RETURN & NO REFUND POLICY ENFORCED', 45, y + 6);
  doc.fillColor(grayText).fontSize(6.8).font('Helvetica').text(
    'All purchases are final. Piercing jewelry and studio equipment cannot be returned, exchanged, or refunded after order placement due to strict hygiene and health standards. Exceptional cases require proof photos of damaged goods within 48h of delivery.',
    45,
    y + 18,
    { width: 505 }
  );

  // Footer Tagline (Positioned safely above bottom margin to guarantee 1 single page)
  const footerY = Math.min(y + 46, 800);
  doc.fillColor('#888888').fontSize(6.5).font('Helvetica').text(
    'Thank you for choosing AURELIA Fine Piercing Jewelry. For support, visit https://aurelia-piercing.com/account',
    35,
    footerY,
    { align: 'center', width: 525 }
  );

  doc.end();
};
