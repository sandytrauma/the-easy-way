import { PropertySubNav } from "@/components/pos/property-sub-nav";

export default function SingleHotelLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen"> {/* Changed h-full to h-screen to fix height */}
      <PropertySubNav />
      
      {/* Changed overflow-hidden to overflow-y-auto */}
      <main className="flex-1 overflow-y-auto relative bg-[#F8FAFC]">
        {children}
      </main>
    </div>
  );
}