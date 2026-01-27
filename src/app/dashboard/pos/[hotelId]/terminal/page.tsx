"use client";

import React, { useState, use, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Plus, Minus, Trash2, CreditCard, 
  Utensils, Loader2, Store
} from "lucide-react";
import { toast } from "sonner";
import { CheckoutView } from "@/components/pos/checkout-view";
import { getMenuItems, getCategories } from "@/lib/actions/menu-actions";
// IMPORT the kitchen action we created earlier
import { placeKitchenOrder } from "@/lib/actions/kitchen-actions";

export default function PosTerminal({ params }: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = use(params);

  // --- States ---
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Data Loading ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dbProducts, dbCategories] = await Promise.all([
        getMenuItems(hotelId),
        getCategories(hotelId)
      ]);
      setProducts(dbProducts);
      setCategories(dbCategories);
    } catch (error) {
      toast.error("Failed to sync with property database");
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Filtering Logic ---
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === "all" || p.categoryId === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // --- Cart Actions ---
  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const tax = subtotal * 0.05; 
  const total = subtotal + tax;

  const addToCart = (product: any) => {
    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  // --- MODIFIED: Handle Finalization ---
  const handleOrderSuccess = async (roomNumber: string) => {
    try {
      // 1. Push to Kitchen Database
      await placeKitchenOrder({
        hotelId,
        roomNumber: roomNumber || "Walk-in",
        items: cart.map(item => ({ 
          name: item.name, 
          qty: item.quantity,
          inventoryId: item.inventoryId // Ensure your menu items have this link
        }))
      });

      // 2. Clear UI
      setCart([]); 
      setShowCheckout(false); 
      toast.success("Order pushed to Kitchen KDS!");
    } catch (error) {
      toast.error("Payment processed, but Kitchen Sync failed.");
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="font-bold text-slate-500 uppercase text-[10px] tracking-[0.2em]">Initializing Terminal...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100">
        
        {/* LEFT: Menu Selection */}
        <div className="flex-1 flex flex-col p-4 md:p-6 gap-6 overflow-hidden">
          <div className="space-y-4 shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                placeholder="Search menu..." 
                className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-lg font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              <Button
                onClick={() => setActiveCategory("all")}
                variant={activeCategory === "all" ? "default" : "outline"}
                className={`h-12 px-6 rounded-xl border-none shadow-sm gap-2 transition-all font-black text-[10px] uppercase tracking-widest ${
                  activeCategory === "all" ? "bg-indigo-600 text-white" : "bg-white"
                }`}
              >
                <Store className="h-4 w-4" /> All
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  className={`h-12 px-6 rounded-xl border-none shadow-sm gap-2 whitespace-nowrap transition-all font-black text-[10px] uppercase tracking-widest ${
                    activeCategory === cat.id ? "bg-indigo-600 text-white scale-105" : "bg-white text-slate-600"
                  }`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                <Utensils className="h-16 w-16 mb-2" />
                <p className="font-black uppercase text-xs tracking-widest">No matching items</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-4 border-none shadow-sm rounded-[2rem] cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group relative overflow-hidden bg-white"
                  >
                    <div className={`aspect-square rounded-2xl mb-3 flex items-center justify-center bg-slate-50`}>
                      <Utensils className="h-8 w-8 text-slate-300 group-hover:scale-110 group-hover:text-indigo-500 transition-all" />
                    </div>
                    <h4 className="font-bold text-slate-800 truncate text-sm">{product.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-indigo-600 font-black italic">${Number(product.price).toFixed(2)}</span>
                      <div className="bg-indigo-50 p-2 rounded-xl group-hover:bg-indigo-600 transition-colors">
                        <Plus className="h-4 w-4 text-indigo-600 group-hover:text-white" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart Sidebar */}
        <div className="w-full lg:w-[420px] bg-white border-l shadow-2xl flex flex-col z-10">
          <div className="p-8 border-b flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-black italic tracking-tighter text-slate-900">Current Order</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terminal Active</p>
            </div>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-lg">
              HOTEL: {hotelId.slice(0, 5).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-40 italic">
                <p className="font-black uppercase text-xs tracking-widest">Cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl group">
                  <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-xs italic">
                    {item.quantity}x
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-slate-800">{item.name}</h5>
                    <p className="text-xs text-indigo-600 font-black italic">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setCart(c => c.filter(i => i.id !== item.id))}
                    className="rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-slate-50 border-t space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <span>Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                <span className="text-sm font-black uppercase tracking-widest text-slate-900">Total Amount</span>
                <span className="text-4xl font-black italic tracking-tighter text-indigo-600">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            
            <Button 
              disabled={cart.length === 0}
              onClick={() => setShowCheckout(true)}
              className="w-full h-20 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black italic text-xl shadow-2xl shadow-indigo-200 transition-all active:scale-95"
            >
              <CreditCard className="mr-3 h-6 w-6" /> Complete Order
            </Button>
          </div>
        </div>
      </div>

      {showCheckout && (
        <CheckoutView 
          total={total} 
          hotelId={hotelId}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleOrderSuccess} // Triggers the kitchen sync
        />
      )}
    </div>
  );
}