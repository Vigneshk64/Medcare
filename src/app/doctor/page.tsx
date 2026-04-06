"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { RoleGuard } from "../components/RoleGuard";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Portal</h1>
            {user && (
              <p className="text-gray-600 mt-1">Welcome, {user.displayName}</p>
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

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("search")}
              className={`py-4 px-2 font-semibold text-lg border-b-4 transition ${
                activeTab === "search"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Search Medicines
            </button>
            <button
              onClick={() => setActiveTab("request")}
              className={`py-4 px-2 font-semibold text-lg border-b-4 transition ${
                activeTab === "request"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Request Medicines
            </button>
            <button
              onClick={() => setActiveTab("myrequests")}
              className={`py-4 px-2 font-semibold text-lg border-b-4 transition ${
                activeTab === "myrequests"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              My Requests ({myRequests.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Search Tab */}
        {activeTab === "search" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Check Medicine Availability
            </h2>
            <input
              type="text"
              placeholder="Search by medicine name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 mb-8 font-bold text-gray-900 placeholder-gray-500"
            />

            {/* Results */}
            <div>
              {loading && (
                <div className="text-center text-gray-600 text-lg py-8">
                  Loading medicines...
                </div>
              )}

              {!loading && search && results.length === 0 && (
                <div className="text-center text-gray-600 text-lg py-8">
                  No medicines found.
                </div>
              )}

              {results.map((medicine) => (
                <div
                  key={medicine.id}
                  className="bg-white rounded-lg shadow-sm p-6 mb-4 border-l-4 border-blue-600"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {medicine.name}
                      </h3>
                      {medicine.aliases && medicine.aliases.length > 0 && (
                        <p className="text-gray-600 text-sm mt-1">
                          Also known as: {medicine.aliases.join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">
                        {medicine.quantity}
                      </p>
                      <p className="text-gray-600 text-lg">{medicine.unit}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Tab */}
        {activeTab === "request" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Request Medicines for Patient
            </h2>

            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Patient Name"
                  value={requestForm.patientName}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      patientName: e.target.value,
                    })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900 placeholder-gray-500"
                />
                <input
                  type="tel"
                  placeholder="Patient Phone"
                  value={requestForm.patientPhone}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      patientPhone: e.target.value,
                    })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Add Medicines */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Add Medicines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select
                  value={selectedMed}
                  onChange={(e) => setSelectedMed(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900"
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
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900 placeholder-gray-500"
                />

                <button
                  onClick={addMedicineToRequest}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 rounded-lg"
                >
                  Add
                </button>
              </div>

              {/* Selected Medicines */}
              {requestForm.selectedMedicines.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Selected Medicines:
                  </h4>
                  <div className="space-y-2">
                    {requestForm.selectedMedicines.map((med) => (
                      <div
                        key={med.medicineName}
                        className="bg-gray-50 p-4 rounded-lg flex items-center justify-between border-l-4 border-green-600"
                      >
                        <span className="font-semibold text-gray-900">
                          {med.medicineName} - {med.quantity} units
                        </span>
                        <button
                          onClick={() =>
                            removeMedicineFromRequest(med.medicineName)
                          }
                          className="text-red-600 hover:text-red-800 font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={submitRequest}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === "myrequests" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              My Medicine Requests
            </h2>

            {myRequests.length === 0 ? (
              <div className="text-center text-gray-600 py-12 bg-white rounded-lg">
                No requests yet
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">
                          PATIENT
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {req.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">
                          PHONE
                        </p>
                        <p className="text-lg text-gray-700">{req.patientPhone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">
                          STATUS
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-lg font-bold ${
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

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-bold text-gray-900 mb-2 text-base">
                        Medicines:
                      </p>
                      <ul className="text-gray-900 font-semibold">
                        {req.medicines.map((med) => (
                          <li key={med.medicineName} className="text-sm">
                            • {med.medicineName} - {med.quantity} units
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
  );
}

export default function DoctorDashboard() {
  return (
    <RoleGuard requiredRole="doctor">
      <DoctorDashboardContent />
    </RoleGuard>
  );
}
