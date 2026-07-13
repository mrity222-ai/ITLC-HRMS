export const downloadPaymentSlip = (paymentDetails: any, companyDetails: any) => {
  const invoiceHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Payment Receipt - ${paymentDetails.invoiceNumber}</title>
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; color: #333; margin: 0; padding: 40px; background: #f8fafc; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .brand { font-size: 24px; font-weight: 800; color: #4f46e5; }
        .title { font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
        .invoice-meta { text-align: right; color: #64748b; font-size: 14px; }
        .invoice-meta strong { color: #0f172a; }
        
        .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .party { width: 45%; }
        .party h3 { font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 8px; }
        .party p { margin: 4px 0; font-size: 15px; color: #1e293b; }
        
        .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
        .table th { text-align: left; padding: 12px; background: #f1f5f9; color: #475569; font-size: 13px; text-transform: uppercase; font-weight: 600; border-bottom: 2px solid #cbd5e1; }
        .table td { padding: 16px 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
        
        .totals { width: 300px; margin-left: auto; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; color: #475569; }
        .total-row.grand-total { font-size: 20px; font-weight: 700; color: #0f172a; border-top: 2px solid #e2e8f0; padding-top: 16px; margin-top: 8px; }
        
        .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        .status-badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .status-successful { background: #dcfce7; color: #166534; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .status-pending { background: #fef9c3; color: #854d0e; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div>
            <div class="brand">HRMS PLATFORM</div>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Enterprise Subscription Billing</p>
          </div>
          <div class="invoice-meta">
            <h1 class="title">RECEIPT</h1>
            <p>Invoice No: <strong>${paymentDetails.invoiceNumber || 'N/A'}</strong></p>
            <p>Date: <strong>${new Date(paymentDetails.date).toLocaleDateString()}</strong></p>
            <span class="status-badge status-${paymentDetails.status || 'successful'}">${paymentDetails.status || 'Successful'}</span>
          </div>
        </div>
        
        <div class="parties">
          <div class="party">
            <h3>Billed To:</h3>
            <p><strong>${companyDetails.name || paymentDetails.companyName || 'Company'}</strong></p>
            <p>${companyDetails.email || ''}</p>
            <p>${companyDetails.address || ''}</p>
            <p>${companyDetails.city || ''} ${companyDetails.state || ''}</p>
          </div>
          <div class="party" style="text-align: right;">
            <h3>Payment Method:</h3>
            <p><strong>Gateway:</strong> <span style="text-transform: capitalize">${paymentDetails.gateway || 'Stripe'}</span></p>
            <p><strong>Transaction ID:</strong> ${paymentDetails.id || 'N/A'}</p>
          </div>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: 600;">SaaS Subscription Plan</div>
                <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Monthly billing cycle</div>
              </td>
              <td style="text-align: right; font-weight: 600;">$${paymentDetails.amount}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>$${paymentDetails.amount}</span>
          </div>
          <div class="total-row">
            <span>Tax (0%)</span>
            <span>$0.00</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Paid</span>
            <span>$${paymentDetails.amount}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>If you have any questions about this receipt, please contact billing@superowner.io</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  } else {
    alert("Please allow popups to download the payment slip.");
  }
};
