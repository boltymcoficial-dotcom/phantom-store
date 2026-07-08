import { getStorefrontData } from "@/lib/store";
import { StorefrontClient } from "@/components/storefront/storefront-client";


export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getStorefrontData();
  
  return <StorefrontClient data={data} />;
}
