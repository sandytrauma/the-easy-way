"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { getInventory, addInventoryItem } from "@/lib/actions/kitchen-actions";
import { AddInventoryModal } from "@/components/inventory/add-inventory-modal";
import { toast } from "sonner";

export default function InventoryPage({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = use(params); // Unwrap here {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getInventory(hotelId);
    setItems(data);
    setLoading(false);
  }, [hotelId]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900">Inventory</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Stock Control System</p>
          </div>
          <AddInventoryModal hotelId={hotelId} onSuccess={loadData} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : (
          <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-none">
                  <TableHead className="px-8 font-black uppercase text-[10px] text-slate-400">Item</TableHead>
                  <TableHead className="font-black uppercase text-[10px] text-slate-400">Category</TableHead>
                  <TableHead className="font-black uppercase text-[10px] text-slate-400">Stock</TableHead>
                  <TableHead className="font-black uppercase text-[10px] text-slate-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-slate-50">
                    <TableCell className="px-8 font-bold text-slate-900">{item.itemName}</TableCell>
                    <TableCell>
                      <span className="text-[10px] font-black uppercase bg-slate-100 px-2 py-1 rounded-lg text-slate-500">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="font-black">{item.quantity} {item.unit}</TableCell>
                    <TableCell>
                      {item.quantity <= item.minStockLevel ? (
                        <div className="flex items-center gap-1 text-rose-500 font-black text-[10px] uppercase">
                          <AlertTriangle className="h-3 w-3" /> Low Stock
                        </div>
                      ) : (
                        <span className="text-emerald-500 font-black text-[10px] uppercase">Healthy</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}