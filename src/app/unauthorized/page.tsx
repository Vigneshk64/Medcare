"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import Link from "next/link";

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
        <div className="text-5xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 text-lg mb-8">
          You do not have permission to access this page. If you believe this is
          an error, please contact the pharmacy admin.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
          >
            Sign Out
          </button>
          <Link
            href="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
