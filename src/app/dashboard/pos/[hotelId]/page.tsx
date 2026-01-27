import { redirect } from "next/navigation";

// Define the type as a Promise
type Props = {
  params: Promise<{ hotelId: string }>;
};

export default async function HotelRootPage({ params }: Props) {
  // 1. Await the params promise
  const { hotelId } = await params;

  // 2. Safety check: If for some reason hotelId is missing, go back to dashboard
  if (!hotelId || hotelId === "undefined") {
    redirect("/dashboard");
  }

  // 3. Redirect to your preferred default tab (Terminal)
  redirect(`/dashboard/pos/${hotelId}/terminal`);
}