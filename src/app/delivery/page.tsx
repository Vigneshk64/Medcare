"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  where,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import GlassCard from "../components/GlassCard";
import StatusBadge from "../components/StatusBadge";

function DeliveryDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);

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

  const handleStatusUpdate = async (deliveryId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "deliveries", deliveryId), {
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating delivery:", error);
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  const deliveredCount = deliveries.filter(
    (d) => d.status === "Delivered"
  ).length;
  const totalCount = deliveries.length;

  const sidebarItems = [
    { id: 'today', label: 'Today\'s Deliveries', icon: '📦' },
  ];

  return (
    <DashboardLayout
      role="delivery"
      title={`Delivery Dashboard - ${deliveredCount}/${totalCount} completed`}
      sidebarItems={sidebarItems}
      activeTab="today"
      onTabChange={() => {}}
      onSignOut={handleSignOut}
    >
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading deliveries...</p>
          </div>
        </div>
      )}

      {!loading && deliveries.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✅</div>
          <p className="text-gray-300 text-lg">No deliveries for today. Great job!</p>
        </div>
      )}

      {deliveries.map((delivery) => (
        <GlassCard key={delivery.id} className="mb-6">
          {/* Customer Name - Large for mobile */}
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {delivery.customerName}
          </h2>

          {/* Address */}
          <p className="text-xl sm:text-2xl text-gray-300 mb-6">
            {delivery.address}
          </p>

          {/* Status Badge */}
          <div className="mb-6">
            <div className="inline-block">
              <StatusBadge
                status={
                  delivery.status === "Delivered"
                    ? "completed"
                    : delivery.status === "Unavailable"
                      ? "danger"
                      : "pending"
                }
              />
            </div>
          </div>

          {/* Action Buttons - Large for mobile */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {delivery.status !== "Delivered" && (
              <button
                onClick={() => handleStatusUpdate(delivery.id, "Delivered")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg sm:text-xl py-4 sm:py-5 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                ✓ Delivered
              </button>
            )}

            {delivery.status !== "Unavailable" && (
              <button
                onClick={() => handleStatusUpdate(delivery.id, "Unavailable")}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg sm:text-xl py-4 sm:py-5 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                ✗ Unavailable
              </button>
            )}

            <button
              onClick={() => handleCall(delivery.phone)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg sm:text-xl py-4 sm:py-5 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              📞 Call
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
            <p className="text-gray-400">
              <span className="font-semibold">Phone:</span> {delivery.phone}
            </p>
            <p className="text-gray-400">
              <span className="font-semibold">Medicine:</span> {delivery.medicine}
            </p>
            <p className="text-gray-400">
              <span className="font-semibold">Dosage:</span> {delivery.dosage}
            </p>
          </div>
        </GlassCard>
      ))}
    </DashboardLayout>
  );
}

export default function DeliveryDashboard() {
  return <DeliveryDashboardContent />;
}
