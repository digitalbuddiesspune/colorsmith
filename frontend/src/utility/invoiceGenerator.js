import jsPDF from 'jspdf';
import { formatOrderId } from './formatedOrderId';

// Convert number to words for invoice amount (Indian numbering system)
export const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  const convertHundreds = (n) => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const one = n % 10;
      return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
    }
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    return ones[hundred] + ' Hundred' + (remainder > 0 ? ' ' + convertHundreds(remainder) : '');
  };
  
  const convert = (n) => {
    if (n === 0) return '';
    
    if (n < 1000) return convertHundreds(n);
    if (n < 100000) {
      const thousand = Math.floor(n / 1000);
      const remainder = n % 1000;
      return convertHundreds(thousand) + ' Thousand' + (remainder > 0 ? ' ' + convertHundreds(remainder) : '');
    }
    if (n < 10000000) {
      const lakh = Math.floor(n / 100000);
      const remainder = n % 100000;
      return convertHundreds(lakh) + ' Lakh' + (remainder > 0 ? ' ' + convert(remainder) : '');
    }
    const crore = Math.floor(n / 10000000);
    const remainder = n % 10000000;
    return convertHundreds(crore) + ' Crore' + (remainder > 0 ? ' ' + convert(remainder) : '');
  };
  
  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  
  let result = convert(rupees) + ' Rupees';
  if (paise > 0) {
    result += ' and ' + convertHundreds(paise) + ' Paise';
  }
  return result + ' Only';
};

// Format date for invoice
export const formatDateForInvoice = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Get status text
export const getStatusText = (status) => {
  const texts = {
    pending: 'Order Pending',
    confirmed: 'Order Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return texts[status] || status;
};

// Company Details for Color Smith
const COMPANY_INFO = {
  name: 'COLOR SMITH',
  tagline: 'Your Trusted Cosmetics Raw Materials Partner',
  businessName: 'Color Smith Enterprises',
  email: 'support@color-smith.com',
  gstNumber: '09AHCPC5752E1ZM',
  stateCode: '09',
  state: 'Uttar Pradesh',
};

// Generate invoice PDF
export const generateInvoicePDF = async (order) => {
  try {
    // Debug log to see order structure
    console.log('Generating invoice for order:', order);
    console.log('Order items:', order.items);
    
    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(10);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    const leftMargin = 10;
    const rightMargin = pageWidth - 10;
    const contentWidth = pageWidth - 20;

    // Get customer information from order
    const shippingAddress = order.shippingAddress || {};
    // user may be a populated object { _id, name, email } or just an ID string
    const userName = typeof order.user === 'object' && order.user != null ? order.user.name : '';
    const customerName = shippingAddress.name || userName || 'N/A';
    const customerPhone = shippingAddress.phone || '';
    const customerAddress = [
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.zip
    ].filter(Boolean).join(', ');

    // ========== HEADER SECTION ==========
    // Company name in red, bold, larger font
    doc.setFontSize(24);
    doc.setTextColor(220, 38, 38); // Red color
    doc.setFont(undefined, 'bold');
    doc.text(COMPANY_INFO.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;

    // Tagline
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(COMPANY_INFO.tagline, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    // Company information
    doc.setFontSize(9);
    const companyInfo = `By: ${COMPANY_INFO.businessName} | Email: ${COMPANY_INFO.email} | GST No: ${COMPANY_INFO.gstNumber} | State Code: ${COMPANY_INFO.stateCode}`;
    doc.text(companyInfo, pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;

    // Divider line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 6;

    // "TAX INVOICE" title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('TAX INVOICE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;

    // Divider line
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 8;

    // ========== INVOICE DETAILS SECTION ==========
    // Header bar with dark gray background
    doc.setFillColor(64, 64, 64);
    doc.rect(leftMargin, yPos - 3, contentWidth, 6, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('Invoice Details', leftMargin + 3, yPos + 1);
    yPos += 8;

    // Format order ID
    const formattedOrderId = formatOrderId(order.orderNumber || order._id);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${formattedOrderId.replace('#', '')}`;
    
    // Determine payment mode text
    const paymentModeText = order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment';
    
    const invoiceDetails = [
      ['Invoice No:', invoiceNumber],
      ['Order No:', formattedOrderId],
      ['Order Status:', getStatusText(order.orderStatus)],
      ['Payment Mode:', paymentModeText],
      ['Place of Supply:', `${COMPANY_INFO.stateCode} – ${COMPANY_INFO.state}`],
      ['Invoice Date:', formatDateForInvoice(order.createdAt)],
      ['Order Date:', formatDateForInvoice(order.createdAt)],
      ['Payment Status:', order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'],
    ];

    const col1X = leftMargin;
    const col2X = leftMargin + 60;
    const col1Width = 57;
    const rowHeight = 5;
    const tableStartY = yPos;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    // Draw invoice details table
    invoiceDetails.forEach(([label, value], index) => {
      const rowY = tableStartY + (index * rowHeight);
      
      // Alternating row background
      if (index % 2 === 1) {
        doc.setFillColor(245, 245, 245);
        doc.rect(col1X, rowY - 3, contentWidth, rowHeight, 'F');
      }
      
      // Draw borders
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.line(col1X, rowY - 3, col1X + contentWidth, rowY - 3);
      doc.line(col1X, rowY - 3 + rowHeight, col1X + contentWidth, rowY - 3 + rowHeight);
      doc.line(col1X, rowY - 3, col1X, rowY - 3 + rowHeight);
      doc.line(col1X + contentWidth, rowY - 3, col1X + contentWidth, rowY - 3 + rowHeight);
      doc.line(col2X, rowY - 3, col2X, rowY - 3 + rowHeight);
      
      // Draw text
      doc.setFont(undefined, 'normal');
      doc.text(label, col1X + 3, rowY + 1);
      doc.setFont(undefined, 'bold');
      doc.text(value, col2X + 3, rowY + 1);
    });
    
    yPos = tableStartY + (invoiceDetails.length * rowHeight) + 5;

    // ========== BILL TO SECTION ==========
    doc.setFillColor(64, 64, 64);
    doc.rect(leftMargin, yPos - 3, contentWidth, 6, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To', leftMargin + 3, yPos + 1);
    yPos += 9;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(`Customer Name: ${customerName}`, leftMargin + 3, yPos);
    yPos += 4;
    if (customerPhone) {
      doc.text(`Phone: ${customerPhone}`, leftMargin + 3, yPos);
      yPos += 4;
    }
    doc.text(`Address: ${customerAddress}`, leftMargin + 3, yPos);
    yPos += 4;
    doc.text('GST No: URP', leftMargin + 3, yPos);
    yPos += 8;

    // ========== ORDER DETAILS SECTION ==========
    doc.setFillColor(64, 64, 64);
    doc.rect(leftMargin, yPos - 3, contentWidth, 6, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('Order Details', leftMargin + 3, yPos + 1);
    yPos += 8;

    // Table headers
    doc.setFontSize(6.5);
    doc.setFont(undefined, 'bold');
    
    const colPositions = {
      srNo: leftMargin,
      itemName: leftMargin + 8,
      color: leftMargin + 34,
      grade: leftMargin + 56,
      qty: leftMargin + 74,
      rate: leftMargin + 88,
      taxableVal: leftMargin + 106,
      gstPct: leftMargin + 128,
      gstAmt: leftMargin + 142,
      amount: leftMargin + 164,
    };
    
    const headerRowHeight = 6;
    
    // Header background
    doc.setFillColor(230, 230, 230);
    doc.rect(leftMargin, yPos - 3, contentWidth, headerRowHeight, 'F');
    
    // Header borders
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.1);
    doc.line(leftMargin, yPos - 3, rightMargin, yPos - 3);
    doc.line(leftMargin, yPos - 3 + headerRowHeight, rightMargin, yPos - 3 + headerRowHeight);
    
    // Header text
    doc.setTextColor(0, 0, 0);
    doc.text('Sr No', colPositions.srNo + 1, yPos + 1);
    doc.text('Item Name', colPositions.itemName + 1, yPos + 1);
    doc.text('Color', colPositions.color + 1, yPos + 1);
    doc.text('Grade', colPositions.grade + 1, yPos + 1);
    doc.text('Qty', colPositions.qty + 1, yPos + 1);
    doc.text('Rate', colPositions.rate + 1, yPos + 1);
    doc.text('Taxable Val', colPositions.taxableVal + 1, yPos + 1);
    doc.text('GST %', colPositions.gstPct + 1, yPos + 1);
    doc.text('GST Amt', colPositions.gstAmt + 1, yPos + 1);
    doc.text('Amount', colPositions.amount + 1, yPos + 1);
    
    yPos += headerRowHeight;

    // Table rows
    doc.setFont(undefined, 'normal');
    const itemRowHeight = 6;
    let totalTaxableValue = 0;
    let totalGstAmount = 0;

    // Get items array
    const items = order.items || [];
    
    // If no items, show a message
    if (items.length === 0) {
      doc.setTextColor(100, 100, 100);
      doc.text('No items found in this order', leftMargin + 3, yPos + 5);
      yPos += 10;
    }

    items.forEach((item, index) => {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      const itemPrice = item.unitPrice || item.price || 0;
      const itemQty = item.quantity || 1;
      const taxableValue = item.totalPrice || (itemPrice * itemQty);
      const gstRate = 18; // 18% GST
      const itemGstAmt = taxableValue * (gstRate / 100);
      const itemTotal = taxableValue + itemGstAmt;
      
      totalTaxableValue += taxableValue;
      totalGstAmount += itemGstAmt;

      // Get color names from item
      const colorNames = Array.isArray(item.colors) && item.colors.length > 0
        ? item.colors.map(c => c.name || c).filter(Boolean).join(', ')
        : '-';
      const truncatedColor = colorNames.length > 14 ? colorNames.substring(0, 11) + '...' : colorNames;

      const rowTop = yPos - 3;
      
      // Row borders
      doc.setDrawColor(200, 200, 200);
      doc.line(leftMargin, rowTop, rightMargin, rowTop);
      doc.line(leftMargin, rowTop + itemRowHeight, rightMargin, rowTop + itemRowHeight);
      doc.line(leftMargin, rowTop, leftMargin, rowTop + itemRowHeight);
      doc.line(rightMargin, rowTop, rightMargin, rowTop + itemRowHeight);
      
      // Row text
      doc.setTextColor(0, 0, 0);
      doc.text(String(index + 1), colPositions.srNo + 2, yPos + 1);
      
      // Truncate long product names
      const productName = String(item.productName || 'Product');
      const truncatedName = productName.length > 16 ? productName.substring(0, 13) + '...' : productName;
      doc.text(truncatedName, colPositions.itemName + 1, yPos + 1);
      
      doc.text(truncatedColor, colPositions.color + 1, yPos + 1);
      doc.text(item.grade?.name || item.gradeName || '-', colPositions.grade + 1, yPos + 1);
      doc.text(String(itemQty), colPositions.qty + 2, yPos + 1);
      doc.text(itemPrice.toFixed(2), colPositions.rate + 1, yPos + 1);
      doc.text(taxableValue.toFixed(2), colPositions.taxableVal + 1, yPos + 1);
      doc.text(`${gstRate}%`, colPositions.gstPct + 2, yPos + 1);
      doc.text(itemGstAmt.toFixed(2), colPositions.gstAmt + 1, yPos + 1);
      doc.text(itemTotal.toFixed(2), colPositions.amount + 1, yPos + 1);
      
      yPos += itemRowHeight;
    });

    yPos += 5;

    // ========== SUMMARY SECTION ==========
    const summaryX = leftMargin + 100;
    const summaryLabelWidth = 50;
    const summaryRowHeight = 5;
    
    // Use calculated totals or fall back to order stored values
    const finalTaxableValue = totalTaxableValue > 0 ? totalTaxableValue : (order.subtotal || 0);
    const finalSgstAmount = order.sgstAmount || (totalGstAmount / 2) || (finalTaxableValue * 0.09);
    const finalCgstAmount = order.cgstAmount || (totalGstAmount / 2) || (finalTaxableValue * 0.09);
    const finalTotalGst = finalSgstAmount + finalCgstAmount;
    const grandTotal = order.grandTotal || (finalTaxableValue + finalTotalGst);
    
    const summaryRows = [
      { label: 'Taxable Value:', value: finalTaxableValue.toFixed(2) },
      { label: 'SGST (9%):', value: finalSgstAmount.toFixed(2) },
      { label: 'CGST (9%):', value: finalCgstAmount.toFixed(2) },
      { label: 'Total GST:', value: finalTotalGst.toFixed(2) },
      { label: 'Total Amount:', value: grandTotal.toFixed(2), isTotal: true },
    ];

    doc.setFontSize(9);
    summaryRows.forEach((row, index) => {
      const rowTop = yPos - 3 + (index * summaryRowHeight);
      
      // Draw borders
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.1);
      doc.line(summaryX, rowTop, rightMargin, rowTop);
      doc.line(summaryX, rowTop + summaryRowHeight, rightMargin, rowTop + summaryRowHeight);
      doc.line(summaryX, rowTop, summaryX, rowTop + summaryRowHeight);
      doc.line(rightMargin, rowTop, rightMargin, rowTop + summaryRowHeight);
      doc.line(summaryX + summaryLabelWidth, rowTop, summaryX + summaryLabelWidth, rowTop + summaryRowHeight);
      
      if (row.isTotal) {
        doc.setFillColor(64, 64, 64);
        doc.rect(summaryX, rowTop, rightMargin - summaryX, summaryRowHeight, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, 'bold');
      } else {
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
      }
      
      doc.text(row.label, summaryX + 3, rowTop + 3.5);
      const valueWidth = doc.getTextWidth(row.value);
      doc.text(row.value, rightMargin - valueWidth - 3, rowTop + 3.5);
    });

    yPos += (summaryRows.length * summaryRowHeight) + 8;

    // Amount in words
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Amount in Words:', leftMargin + 3, yPos);
    yPos += 4;
    doc.setFont(undefined, 'normal');
    const amountInWords = numberToWords(grandTotal);
    const wordsLines = doc.splitTextToSize(amountInWords, contentWidth - 10);
    wordsLines.forEach(line => {
      doc.text(line, leftMargin + 3, yPos);
      yPos += 4;
    });
    yPos += 8;

    // ========== FOOTER ==========
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a computer generated Invoice.', leftMargin + 3, yPos);
    yPos += 3;
    doc.text('Thank you for your business!', leftMargin + 3, yPos);

    // Save the PDF
    const filename = `Invoice-${formattedOrderId.replace('#', '')}.pdf`;
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};
