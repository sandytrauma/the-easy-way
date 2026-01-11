import { db } from "@/db";
import { users } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { desc } from "drizzle-orm";
import { PlanSwitcher } from "@/components/admin/plan-switcher";

export default async function AdminPage() {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Plan</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.plan === "pro" ? "default" : "secondary"} className="capitalize">
                  {user.plan}
                </Badge>
              </TableCell>
              <TableCell>{user.createdAt?.toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <PlanSwitcher userId={user.id} currentPlan={user.plan!} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}