import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="flex justify-center py-24">
      <Suspense>
        <SignIn />
      </Suspense>
    </div>
  );
}
