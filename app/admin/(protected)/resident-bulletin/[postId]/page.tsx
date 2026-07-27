import { notFound } from "next/navigation";
import { getBulletinPost } from "@/lib/bulletinData";
import BulletinForm from "@/components/admin/BulletinForm";

export const dynamic = "force-dynamic";

export default async function EditBulletinPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const post = await getBulletinPost(postId);
  if (!post) notFound();
  return <BulletinForm post={post} />;
}
