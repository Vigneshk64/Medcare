"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { RoleGuard } from "../components/RoleGuard";

const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-slide-in-down {
    animation: slideInDown 0.6s ease-out;
  }

  .medicine-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .medicine-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
  }

  .tab-button {
    transition: all 0.3s ease;
  }

  .tab-button.active {
    color: rgb(37, 99, 235);
    border-bottom-color: rgb(37, 99, 235);
  }
`;

function DoctorDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("search");
  const [myRequests, setMyRequests] = useState([]);
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);

  // Form states for requesting medicine
  const [requestForm, setRequestForm] = useState({
    selectedMedicines: [],
    patientName: "",
    patientPhone: "",
  });
  const [selectedMed, setSelectedMed] = useState("");
  const [selectedQty, setSelectedQty] = useState("");

  // Fetch all medicines
  useEffect(() => {
    const fetchMedicines = async () => {
      const snapshot = await getDocs(collection(db, "medicines"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMedicines(data);
      setLoading(false);
    };
    fetchMedicines();
  }, []);

  // Fetch doctor's requests
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "doctor_requests"),
      where("requestedBy", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyRequests(data);
    });

    return () => unsubscribe();
  }, [user]);

  // Fuzzy search
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const query = search.toLowerCase();
    const filtered = medicines.filter((med) => {
      const nameMatch = med.name.toLowerCase().includes(query);
      const aliasMatch = med.aliases?.some((alias) =>
        alias.toLowerCase().includes(query)
      );
      return nameMatch || aliasMatch;
    });

    setResults(filtered);
  }, [search, medicines]);

  const addMedicineToRequest = () => {
    if (!selectedMed || !selectedQty) {
      alert("Please select medicine and quantity");
      return;
    }

    const medicine = medicines.find((m) => m.id === selectedMed);
    setRequestForm({
      ...requestForm,
      selectedMedicines: [
        ...requestForm.selectedMedicines,
        {
          medicineId: selectedMed,
          medicineName: medicine.name,
          quantity: parseInt(selectedQty),
        },
      ],
    });

    setSelectedMed("");
    setSelectedQty("");
  };

  const removeMedicineFromRequest = (medicineName) => {
    setRequestForm({
      ...requestForm,
      selectedMedicines: requestForm.selectedMedicines.filter(
        (m) => m.medicineName !== medicineName
      ),
    });
  };

  const submitRequest = async () => {
    if (
      !requestForm.patientName ||
      !requestForm.patientPhone ||
      requestForm.selectedMedicines.length === 0
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "doctor_requests"), {
        requestedBy: user.uid,
        doctorEmail: user.email,
        patientName: requestForm.patientName,
        patientPhone: requestForm.patientPhone,
        medicines: requestForm.selectedMedicines,
        status: "Pending",
        date: todayDate,
        createdAt: new Date(),
      });

      // Reset form
      setRequestForm({
        selectedMedicines: [],
        patientName: "",
        patientPhone: "",
      });

      alert("✅ Request submitted successfully!");
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Modern Header */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg animate-slide-in-down">
          <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black">Doctor Portal</h1>
              {user && (
                <p className="text-blue-100 mt-2 text-lg">Welcome, {user.displayName}</p>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="bg-white text-red-600 hover:bg-red-50 font-bold px-6 py-3 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Modern Tabs */}
        <div className="bg-white border-b-2 border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex gap-1">
              {[
                { id: "search", label: "Search Medicines", icon: "🔍" },
                { id: "request", label: "Request Medicines", icon: "📋" },
                { id: "myrequests", label: `My Requests (${myRequests.length})`, icon: "✓" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button py-4 px-6 font-semibold text-lg border-b-4 transition flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Search Tab */}
          {activeTab === "search" && (
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Search Medicine Availability</h2>
              
              <div className="relative mb-10">
                <input
                  type="text"
                  placeholder="Search by medicine name or alias..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-6 py-4 text-lg border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 font-medium text-gray-900 placeholder-gray-400 bg-white shadow-md transition-all"
                />
                <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-2xl">🔍</span>
              </div>

              {/* Results Grid */}
              <div>
                {loading && (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {!loading && search && results.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-200">
                    <div className="text-5xl mb-4">📋</div>
                    <p className="text-gray-600 text-xl">No medicines found</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((medicine, idx) => (
                    <div
                      key={medicine.id}
                      className="medicine-card bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md animate-fade-in-up"
                      style={{ animationDelay: `${0.1 * idx}s` }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-black text-gray-900 flex-1">{medicine.name}</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">Available</span>
                      </div>
                      
                      {medicine.aliases && medicine.aliases.length > 0 && (
                        <p className="text-gray-600 text-sm mb-4">
                          Also known as: <span className="font-semibold">{medicine.aliases.join(", ")}</span>
                        </p>
                      )}

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-blue-600">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-semibold">Available Quantity:</span>
                          <span className="text-3xl font-black text-blue-600">{medicine.quantity}</span>
                        </div>
                        <p className="text-gray-500 text-sm mt-2">{medicine.unit || "units"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Request Tab */}
          {activeTab === "request" && (
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Request Medicines for Patient</h2>

              <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-lg">
                {/* Patient Info Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    👤 Patient Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Patient Name"
                      value={requestForm.patientName}
                      onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                      className="px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 font-medium text-gray-900 placeholder-gray-400 transition"
                    />
                    <input
                      type="tel"
                      placeholder="Patient Phone"
                      value={requestForm.patientPhone}
                      onChange={(e) => setRequestForm({ ...requestForm, patientPhone: e.target.value })}
                      className="px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 font-medium text-gray-900 placeholder-gray-400 transition"
                    />
                  </div>
                </div>

                {/* Add Medicines Section */}
                <div className="mb-8 pb-8 border-b-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    💊 Add Medicines
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={selectedMed}
                      onChange={(e) => setSelectedMed(e.target.value)}
                      className="px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 font-medium text-gray-900 transition"
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map((med) => (
                        <option key={med.id} value={med.id}>
                          {med.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Quantity"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(e.target.value)}
                      min="1"
                      className="px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 font-medium text-gray-900 placeholder-gray-400 transition"
                    />

                    <button
                      onClick={addMedicineToRequest}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-6 py-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    >
                      ➕ Add
                    </button>
                  </div>
                </div>

                {/* Selected Medicines */}
                {requestForm.selectedMedicines.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Selected Medicines:</h3>
                    <div className="space-y-3">
                      {requestForm.selectedMedicines.map((med, idx) => (
                        <div
                          key={med.medicineName}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl flex items-center justify-between border-2 border-green-200 animate-fade-in-up"
                          style={{ animationDelay: `${0.1 * idx}s` }}
                        >
                          <span className="font-semibold text-gray-900 flex items-center gap-2">
                            💊 {med.medicineName} <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-bold">{med.quantity} units</span>
                          </span>
                          <button
                            onClick={() => removeMedicineFromRequest(med.medicineName)}
                            className="text-red-600 hover:text-red-800 font-bold text-lg transition"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={submitRequest}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  ✓ Submit Request
                </button>
              </div>
            </div>
          )}

          {/* My Requests Tab */}
          {activeTab === "myrequests" && (
            <div className="animate-fade-in-up">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">My Medicine Requests</h2>

              {myRequests.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border-2 border-gray-200">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-600 text-xl">No requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((req, idx) => (
                    <div
                      key={req.id}
                      className="medicine-card bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md animate-fade-in-up"
                      style={{ animationDelay: `${0.1 * idx}s` }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Patient</p>
                          <p className="text-xl font-bold text-gray-900">{req.patientName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Phone</p>
                          <p className="text-lg font-semibold text-gray-900">{req.patientPhone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
                          <p className="text-lg font-semibold text-gray-900">{req.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase">Status</p>
                          <span
                            className={`inline-block px-4 py-2 rounded-lg font-bold text-sm ${
                              req.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : req.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border-l-4 border-blue-600">
                        <p className="font-bold text-gray-900 mb-3">Medicines Requested:</p>
                        <ul className="text-gray-900 space-y-2">
                          {req.medicines.map((med) => (
                            <li key={med.medicineName} className="font-semibold flex items-center gap-2">
                              <span className="text-blue-600">•</span> {med.medicineName} <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">{med.quantity} units</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default function DoctorDashboard() {
  return (
    <RoleGuard requiredRole="doctor">
      <DoctorDashboardContent />
    </RoleGuard>
  );
}
