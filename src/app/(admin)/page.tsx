"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading";

/**
 * Main landing page - redirects to the analytics dashboard
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new analytics dashboard
    router.replace("/dashboard");
  }, [router]);

  return (
    <LoadingSpinner fullScreen text="Loading dashboard..." />
  );
}
