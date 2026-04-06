"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { RoleGuard } from "../components/RoleGuard";

function DeliveryDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);

  // Fetch today's deliveries assigned to this user
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "deliveries"),
      where("assignedTo", "==", user.uid),
      where("date", "==", todayDate)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDeliveries(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, todayDate]);

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      await updateDoc(doc(db, "deliveries", deliveryId), {
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating delivery:", error);
    }
  };

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const deliveredCount = deliveries.filter(
    (d) => d.status === "Delivered"
  ).length;
  const totalCount = deliveries.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Delivery Dashboard
            </h1>
            {user && (
              <p className="text-gray-600 mt-1">
                {deliveredCount} of {totalCount} delivered today
              </p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center text-gray-600 text-lg py-8">
            Loading deliveries...
          </div>
        )}

        {!loading && deliveries.length === 0 && (
          <div className="text-center text-gray-600 text-lg py-12">
            <div className="text-5xl mb-4">✅</div>
            <p>No deliveries for today. Great job!</p>
          </div>
        )}

        {deliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-blue-600"
          >
            {/* Customer Name - Large */}
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              {delivery.customerName}
            </h2>

            {/* Address */}
            <p className="text-2xl text-gray-700 mb-6">{delivery.address}</p>

            {/* Status Badge */}
            <div className="mb-6">
              <span
                className={`text-xl font-bold px-4 py-2 rounded-lg inline-block ${
                  delivery.status === "Delivered"
                    ? "bg-green-100 text-green-800"
                    : delivery.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {delivery.status}
              </span>
            </div>

            {/* Action Buttons - Large */}
            <div className="flex flex-col gap-4 sm:flex-row">
              {delivery.status !== "Delivered" && (
                <button
                  onClick={() => handleStatusUpdate(delivery.id, "Delivered")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4 rounded-lg transition"
                >
                  ✓ Delivered
                </button>
              )}

              {delivery.status !== "Unavailable" && (
                <button
                  onClick={() => handleStatusUpdate(delivery.id, "Unavailable")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xl py-4 rounded-lg transition"
                >
                  ✗ Unavailable
                </button>
              )}

              <button
                onClick={() => handleCall(delivery.phone)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-lg transition"
              >
                📞 Call
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default function DeliveryDashboard() {
  return (
    <RoleGuard requiredRole="delivery">
      <DeliveryDashboardContent />
    </RoleGuard>
  );
}
