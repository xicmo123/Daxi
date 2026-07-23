import { Suspense } from "react";
import MerchantLoginForm from "@/components/merchant/MerchantLoginForm";

export default function MerchantLoginPage() {
  return (
    <Suspense>
      <MerchantLoginForm />
    </Suspense>
  );
}
