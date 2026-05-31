import { Suspense } from "react";
import { GoogleCallbackScreen } from "@/components/screens/google-callback-screen";

export default function GoogleOAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackScreen />
    </Suspense>
  );
}
