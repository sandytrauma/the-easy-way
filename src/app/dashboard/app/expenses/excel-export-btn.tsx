"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function ExcelExportBtn({ data }: { data: any[] }) {
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
      Date: item.date,
      Vendor: item.vendor,
      Category: item.category,
      Amount: item.amount,
      Tax: item.taxAmount
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, "Expense_Report.xlsx");
  };

  return (
    <Button variant="outline" size="sm" onClick={downloadExcel} className="flex gap-2">
      <FileSpreadsheet size={16} />
      Export Excel
    </Button>
  );
}