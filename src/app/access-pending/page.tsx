"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function AccessPendingPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
        <div className="text-5xl mb-6">⏳</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Pending</h1>
        <p className="text-gray-600 text-lg mb-8">
          Your account is awaiting approval from the pharmacy admin. You will be
          notified once your access is granted.
        </p>
        <button
          onClick={handleSignOut}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
