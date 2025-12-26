import SignUpForm from "@/components/features/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | LARRRI Admin Portal",
  description: "Create your LARRRI Admin Portal account to manage land rights and resources initiatives",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
