"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export function RoleGuard({ children, requiredRole }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Still loading, wait

    if (!user) {
      router.push("/login");
      return;
    }

    if (!role) {
      router.push("/login");
      return;
    }

    if (role !== requiredRole) {
      router.push("/unauthorized");
      return;
    }
  }, [user, role, loading, requiredRole, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return null; // Will redirect via useEffect
  }

  if (role !== requiredRole) {
    return null; // Will redirect via useEffect
  }

  return children;
}
