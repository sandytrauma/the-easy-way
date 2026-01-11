import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <Button variant="ghost" className="w-full justify-start text-red-500">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </form>
  );
}