"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Plus, Minus, Trash2, CreditCard, 
  Utensils, Coffee, Pizza, IceCream 
} from "lucide-react";
import { toast } from "sonner";

// Mock Data for UI building
const CATEGORIES = [
  { id: "1", name: "All Items", icon: Utensils },
  { id: "2", name: "Starters", icon: Pizza },
  { id: "3", name: "Main Course", icon: Coffee },
  { id: "4", name: "Desserts", icon: IceCream },
];

const PRODUCTS = [
  { id: "p1", name: "Classic Burger", price: 12.50, categoryId: "2", color: "bg-orange-100" },
  { id: "p2", name: "Margherita Pizza", price: 15.00, categoryId: "2", color: "bg-red-100" },
  { id: "p3", name: "Cold Coffee", price: 5.50, categoryId: "3", color: "bg-blue-100" },
  { id: "p4", name: "Chocolate Lava", price: 8.00, categoryId: "4", color: "bg-purple-100" },
];

export default function PosTerminal({ params }: { params: { hotelId: string } }) {
  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("1");

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% Tax
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

  const updateQuantity = (id: string, delta: number) => {
    setCart(current => current.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id: string) => {
    setCart(current => current.filter(item => item.id !== id));
    toast.error("Item removed from cart");
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-100">
      
      {/* LEFT: Menu Selection (70% width) */}
      <div className="flex-1 flex flex-col p-4 md:p-6 gap-6 overflow-hidden">
        
        {/* Search & Categories */}
        <div className="space-y-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search menu items..." 
              className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-lg focus-visible:ring-2 focus-visible:ring-indigo-600"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                variant={activeCategory === cat.id ? "default" : "outline"}
                className={`h-12 px-6 rounded-xl border-none shadow-sm gap-2 whitespace-nowrap transition-all ${
                  activeCategory === cat.id ? "bg-indigo-600 scale-105" : "bg-white text-slate-600"
                }`}
              >
                <cat.icon className="h-4 w-4" /> {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {PRODUCTS.map((product) => (
              <Card 
                key={product.id}
                onClick={() => addToCart(product)}
                className="p-4 border-none shadow-sm rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group"
              >
                <div className={`aspect-square rounded-xl mb-3 flex items-center justify-center ${product.color}`}>
                  <Utensils className="h-8 w-8 text-slate-400 group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-bold text-slate-800 truncate">{product.name}</h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-indigo-600 font-black">${product.price.toFixed(2)}</span>
                  <div className="bg-indigo-50 p-1 rounded-lg">
                    <Plus className="h-4 w-4 text-indigo-600" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart & Checkout (30% width) */}
      <div className="w-full lg:w-[400px] bg-white border-l shadow-2xl flex flex-col">
        <div className="p-6 border-b shrink-0 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900">Current Order</h3>
          <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
            Table 04
          </span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
              <Pizza className="h-12 w-12 mb-2" />
              <p className="text-sm font-medium">No items selected</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-3 items-center group">
                <div className={`h-12 w-12 rounded-lg shrink-0 ${item.color} flex items-center justify-center font-bold text-xs`}>
                  {item.quantity}x
                </div>
                <div className="flex-1 overflow-hidden">
                  <h5 className="font-bold text-sm truncate">{item.name}</h5>
                  <p className="text-xs text-indigo-600 font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center bg-slate-100 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-indigo-600"><Minus className="h-3 w-3" /></button>
                  <button onClick={() => removeItem(item.id)} className="p-1 hover:text-rose-600"><Trash2 className="h-3 w-3" /></button>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-indigo-600"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Billing Section */}
        <div className="p-6 bg-slate-50 border-t space-y-4 shrink-0">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Service Tax (5%)</span><span className="font-bold">${tax.toFixed(2)}</span></div>
          </div>
          <div className="flex justify-between text-2xl font-black text-slate-900 border-t pt-4 mt-4">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Button 
            disabled={cart.length === 0}
            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 gap-3"
          >
            <CreditCard className="h-6 w-6" /> Complete Payment
          </Button>
        </div>
      </div>

    </div>
  );
}