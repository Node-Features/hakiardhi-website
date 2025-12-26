import SignInForm from "@/components/features/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin Portal | HakiArdhignIn Page | TailAdmin - Next.js Dashboard Template",
  description: "Land Rights Research and Resources Institute",
};


export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
