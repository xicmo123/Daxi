import { readBulletinPosts } from "@/lib/bulletinData";
import BulletinList from "@/components/admin/BulletinList";

export const dynamic = "force-dynamic";

export default async function ResidentBulletinDashboard() {
  const posts = await readBulletinPosts();
  return <BulletinList posts={posts} />;
}
