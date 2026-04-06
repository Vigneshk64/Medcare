"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const authUser = result.user;

      // Check if user exists in the users collection
      const userDoc = await getDoc(doc(db, "users", authUser.uid));

      if (userDoc.exists()) {
        // User already has a role, redirect to dashboard
        const role = userDoc.data().role;
        redirectToDashboard(role);
      } else {
        // New user - show role selection
        setUser(authUser);
      }
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const handleRoleSelect = async (role) => {
    if (!user) return;

    setLoading(true);

    try {
      // Save user with selected role to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
        createdAt: new Date(),
      });

      // Wait a moment for Firestore to sync
      await new Promise((resolve) => setTimeout(resolve, 500));

      redirectToDashboard(role);
    } catch (err) {
      setError("Failed to save role. Please try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const redirectToDashboard = (role) => {
    if (role === "admin") router.push("/admin");
    else if (role === "doctor") router.push("/doctor");
    else if (role === "delivery") router.push("/delivery");
    else router.push("/");
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setSelectedRole(null);
  };

  // Show role selection screen
  if (user && !selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">MedCare</h1>
            <p className="text-gray-600 text-lg">Welcome, {user.displayName || user.email}</p>
          </div>

          <p className="text-gray-900 text-center mb-8 text-lg font-bold">
            Choose your role:
          </p>

          {/* Role Selection Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect("doctor")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition"
            >
              👨‍⚕️ Doctor
            </button>
            <button
              onClick={() => handleRoleSelect("delivery")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition"
            >
              🚚 Delivery Boy (Arjun)
            </button>
            <button
              onClick={() => handleRoleSelect("admin")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition"
            >
              👔 Admin (Rajan)
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full mt-6 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 px-6 rounded-lg text-lg transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Show login screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MedCare</h1>
          <p className="text-gray-600 text-lg">Staff & Admin Sign In</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg text-lg transition flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Signing in...
            </>
          ) : (
            <>
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-4">
            Or return to the customer page
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-semibold text-lg"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
