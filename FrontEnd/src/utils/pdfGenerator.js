import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateGroupPDF = (groupData, expenses, settlements, members) => {
  try {
    console.log('[PDF GENERATOR] Starting PDF generation for group:', groupData.name);
    
    const doc = new jsPDF();
    let yPos = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Group Expense Report', 105, yPos, { align: 'center' });
    yPos += 15;
    
    // Group Details
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Group Details', 20, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Group Name: ${groupData.name}`, 20, yPos);
    yPos += 6;
    
    if (groupData.description) {
      doc.text(`Description: ${groupData.description}`, 20, yPos);
      yPos += 6;
    }
    
    doc.text(`Status: ${groupData.status}`, 20, yPos);
    yPos += 6;
    
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, yPos);
    yPos += 12;
    
    // Members Section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Members', 20, yPos);
    yPos += 8;
    
    const memberRows = members.map((member) => [
      member.user.username,
      member.user.email,
      `₹${member.balance.toFixed(2)}`,
      member.balance > 0 ? 'Gets' : member.balance < 0 ? 'Owes' : 'Settled',
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: [['Name', 'Email', 'Balance', 'Status']],
      body: memberRows,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] },
      margin: { left: 20, right: 20 },
    });
    
    yPos = doc.lastAutoTable.finalY + 12;
    
    // Expenses Section
    if (expenses.length > 0) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Expenses', 20, yPos);
      yPos += 8;
      
      const expenseRows = expenses.map((expense) => [
        new Date(expense.createdAt).toLocaleDateString('en-IN'),
        expense.name,
        expense.paidBy.username,
        `₹${expense.amount.toFixed(2)}`,
        expense.splitAmong.length,
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Date', 'Description', 'Paid By', 'Amount', 'Split Among']],
        body: expenseRows,
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233] },
        margin: { left: 20, right: 20 },
      });
      
      yPos = doc.lastAutoTable.finalY + 12;
      
      // Total Expenses
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`, 20, yPos);
      yPos += 12;
    }
    
    // Settlements Section
    if (settlements.length > 0) {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Settlement History', 20, yPos);
      yPos += 8;
      
      const settlementRows = settlements.map((settlement) => [
        new Date(settlement.createdAt).toLocaleDateString('en-IN'),
        settlement.paidBy.username,
        settlement.paidTo.username,
        `₹${settlement.amount.toFixed(2)}`,
        settlement.paymentMode,
      ]);
      
      doc.autoTable({
        startY: yPos,
        head: [['Date', 'Paid By', 'Paid To', 'Amount', 'Mode']],
        body: settlementRows,
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233] },
        margin: { left: 20, right: 20 },
      });
      
      yPos = doc.lastAutoTable.finalY + 12;
      
      // Total Settlements
      const totalSettlements = settlements.reduce((sum, set) => sum + set.amount, 0);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`Total Settlements: ₹${totalSettlements.toFixed(2)}`, 20, yPos);
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const fileName = `${groupData.name.replace(/[^a-z0-9]/gi, '_')}_Report_${Date.now()}.pdf`;
    doc.save(fileName);
    
    console.log('[PDF GENERATOR] PDF generated successfully:', fileName);
    return true;
  } catch (error) {
    console.error('[PDF GENERATOR ERROR] Failed to generate PDF:', error);
    throw error;
  }
};