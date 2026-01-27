"use client";

import { use, useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Utensils, Tag, Plus, Loader2, LayoutGrid, Search, X } from "lucide-react";
import { AddMenuItemModal } from "@/components/pos/add-menu-item-modal";
import { getMenuItems, deleteMenuItem, createCategory } from "@/lib/actions/menu-actions";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function MenuPage({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = use(params);
  const [items, setItems] = useState<any[]>([]);
  const [catName, setCatName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMenuItems(hotelId);
      setItems(data);
    } catch (error) {
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCategory = async () => {
    if (!catName) return;
    try {
      await createCategory(hotelId, catName);
      toast.success("Category created");
      setCatName("");
      loadData();
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  // Filter logic for the search bar
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2 selection:bg-indigo-100">
      {/* STICKY HEADER */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-4 md:px-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <LayoutGrid className="text-white h-5 w-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900 hidden sm:block">
              Menu Manager
            </h1>
          </div>

          {/* SEARCH BAR */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or categories..."
              className="pl-10 pr-10 h-11 bg-slate-100/50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-600"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="h-3 w-3 text-slate-500" />
              </button>
            )}
          </div>

          <AddMenuItemModal hotelId={hotelId} onRefresh={loadData} />
        </div>
      </div>

      <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-8 pb-32">
        
        {/* STEP 1: CATEGORY CREATOR */}
        <section className="bg-white p-5 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-indigo-600" />
            <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">
              Step 1: Create Category
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="e.g. Beverages, Main Course..."
              className="flex-1 rounded-2xl bg-slate-50 border-none h-14 text-base px-6 focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all"
            />
            <Button 
              onClick={handleAddCategory} 
              className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold transition-transform active:scale-95 shadow-lg shadow-slate-200"
            >
              <Plus className="mr-2 h-5 w-5" /> Create
            </Button>
          </div>
        </section>

        {/* STEP 2: PRODUCT LIST (SINGLE PAGE SCROLL) */}
        <section className="space-y-6 overflow-y-scroll">
          <div className="flex items-center justify-between px-4">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Step 2: Your Products ({filteredItems.length})
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin h-12 w-12 text-indigo-600" />
              <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing Database</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.length === 0 ? (
                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Utensils className="mx-auto h-16 w-16 text-slate-200 mb-4" />
                  <p className="text-slate-500 font-bold text-lg">No matches found</p>
                  <p className="text-slate-400 text-sm">Try adjusting your search or add a new item.</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="group p-5 flex items-center justify-between border-none shadow-sm rounded-[2rem] bg-white hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:rotate-6 duration-500 ${item.color || 'bg-slate-100'}`}>
                        <Utensils className="h-7 w-7 text-slate-500/40" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-block text-[9px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg font-black uppercase tracking-tighter">
                            {item.categoryName || "Uncategorized"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right mr-2">
                        <p className="text-[10px] font-bold text-slate-300 uppercase leading-none mb-1">Price</p>
                        <p className="font-black text-2xl text-slate-900 tracking-tighter">${item.price}</p>
                      </div>
                      <Button 
                        onClick={() => {
                          const promise = deleteMenuItem(item.id, hotelId).then(loadData);
                          toast.promise(promise, {
                            loading: 'Removing item...',
                            success: 'Item deleted',
                            error: 'Delete failed'
                          });
                        }} 
                        variant="ghost" 
                        className="h-12 w-12 rounded-2xl text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}