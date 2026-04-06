"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { RoleGuard } from "../components/RoleGuard";

function AdminDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("inventory");
  const [medicines, setMedicines] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryFilter, setDeliveryFilter] = useState("All");
  const [users, setUsers] = useState([]);
  const [doctorRequests, setDoctorRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState("All");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState("");
  const [loading, setLoading] = useState(true);
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);

  // Form states
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    aliases: "",
    quantity: "",
    price: "",
    unit: "tablets",
  });

  const [newDelivery, setNewDelivery] = useState({
    customerName: "",
    address: "",
    phone: "",
    medicines: "",
    assignedTo: "",
  });

  // Fetch medicines
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

  // Fetch deliveries (real-time)
  useEffect(() => {
    const q = query(
      collection(db, "deliveries"),
      where("date", "==", todayDate)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDeliveries(data);
    });

    return () => unsubscribe();
  }, [todayDate]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    };
    fetchUsers();
  }, []);

  // Fetch doctor requests (real-time)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "doctor_requests"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctorRequests(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // Add medicine
  const handleAddMedicine = async () => {
    if (
      !newMedicine.name ||
      !newMedicine.quantity ||
      !newMedicine.price ||
      !newMedicine.unit
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "medicines"), {
        name: newMedicine.name,
        aliases: newMedicine.aliases
          ? newMedicine.aliases.split(",").map((a) => a.trim())
          : [],
        quantity: parseInt(newMedicine.quantity),
        price: parseFloat(newMedicine.price),
        unit: newMedicine.unit,
      });

      setNewMedicine({
        name: "",
        aliases: "",
        quantity: "",
        price: "",
        unit: "tablets",
      });

      // Refresh medicines
      const snapshot = await getDocs(collection(db, "medicines"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMedicines(data);
    } catch (error) {
      console.error("Error adding medicine:", error);
    }
  };

  // Update medicine quantity
  const handleUpdateQuantity = async (medicineId, newQuantity) => {
    try {
      await updateDoc(doc(db, "medicines", medicineId), {
        quantity: parseInt(newQuantity),
      });

      // Update local state
      setMedicines(
        medicines.map((med) =>
          med.id === medicineId
            ? { ...med, quantity: parseInt(newQuantity) }
            : med
        )
      );
    } catch (error) {
      console.error("Error updating medicine:", error);
    }
  };

  // Delete medicine
  const handleDeleteMedicine = async (medicineId) => {
    if (!window.confirm("Are you sure you want to delete this medicine?"))
      return;

    try {
      await deleteDoc(doc(db, "medicines", medicineId));
      setMedicines(medicines.filter((med) => med.id !== medicineId));
    } catch (error) {
      console.error("Error deleting medicine:", error);
    }
  };

  // Add delivery
  const handleAddDelivery = async () => {
    if (
      !newDelivery.customerName ||
      !newDelivery.address ||
      !newDelivery.phone ||
      !newDelivery.medicines ||
      !newDelivery.assignedTo
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "deliveries"), {
        customerName: newDelivery.customerName,
        address: newDelivery.address,
        phone: newDelivery.phone,
        medicines: newDelivery.medicines
          .split(",")
          .map((m) => m.trim()),
        assignedTo: newDelivery.assignedTo,
        date: todayDate,
        status: "Pending",
      });

      setNewDelivery({
        customerName: "",
        address: "",
        phone: "",
        medicines: "",
        assignedTo: "",
      });
    } catch (error) {
      console.error("Error adding delivery:", error);
    }
  };

  // Update doctor request status
  const handleUpdateRequestStatus = async (requestId, newStatus) => {
    try {
      await updateDoc(doc(db, "doctor_requests", requestId), {
        status: newStatus,
      });
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  // Assign request to delivery boy
  const handleAssignToDelivery = async () => {
    if (!selectedDeliveryBoy || !selectedRequest) {
      alert("Please select a delivery boy");
      return;
    }

    try {
      // Create a delivery from the request
      const medicinesList = selectedRequest.medicines
        .map((m) => m.medicineName)
        .join(", ");

      await addDoc(collection(db, "deliveries"), {
        customerName: selectedRequest.patientName,
        address: `Patient of Dr. ${selectedRequest.doctorEmail}`,
        phone: selectedRequest.patientPhone,
        medicines: selectedRequest.medicines.map((m) => m.medicineName),
        assignedTo: selectedDeliveryBoy,
        date: todayDate,
        status: "Pending",
        linkedRequest: selectedRequest.id,
      });

      // Update request status to Assigned
      await updateDoc(doc(db, "doctor_requests", selectedRequest.id), {
        status: "Assigned",
      });

      alert("✅ Request assigned to delivery boy successfully!");
      setSelectedRequest(null);
      setSelectedDeliveryBoy("");
    } catch (error) {
      console.error("Error assigning delivery:", error);
      alert("Failed to assign delivery");
    }
  };

  // Get delivery users
  const deliveryUsers = users.filter((u) => u.role === "delivery");

  // Filter deliveries
  const filteredDeliveries = deliveries.filter(
    (d) =>
      deliveryFilter === "All" ||
      (deliveryFilter === "Pending" && d.status === "Pending") ||
      (deliveryFilter === "Delivered" && d.status === "Delivered") ||
      (deliveryFilter === "Unavailable" && d.status === "Unavailable")
  );

  // Filter doctor requests
  const filteredRequests = doctorRequests.filter(
    (r) =>
      requestFilter === "All" ||
      (requestFilter === "Pending" && r.status === "Pending") ||
      (requestFilter === "Assigned" && r.status === "Assigned") ||
      (requestFilter === "Delivered" && r.status === "Delivered") ||
      (requestFilter === "Rejected" && r.status === "Rejected")
  );

  // Calculate stats
  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter((m) => m.quantity < 10).length;
  const todayDeliveredCount = deliveries.filter(
    (d) => d.status === "Delivered"
  ).length;

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`py-4 px-2 font-semibold text-lg border-b-4 transition ${
                activeTab === "inventory"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab("deliveries")}
              className={`py-4 px-2 font-semibold text-lg border-b-4 transition ${
                activeTab === "deliveries"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Deliveries
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-2 font-semibold text-lg border-b-4 transition ${
                activeTab === "requests"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Medicine Requests
            </button>
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-2 font-semibold text-lg border-b-4 transition ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <div>
            {/* Add Medicine Form */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add New Medicine
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={newMedicine.name}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, name: e.target.value })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900 placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Aliases (comma-separated)"
                  value={newMedicine.aliases}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, aliases: e.target.value })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900 placeholder-gray-500"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={newMedicine.quantity}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, quantity: e.target.value })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900 placeholder-gray-500"
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  value={newMedicine.price}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, price: e.target.value })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900 placeholder-gray-500"
                />
                <select
                  value={newMedicine.unit}
                  onChange={(e) =>
                    setNewMedicine({ ...newMedicine, unit: e.target.value })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900"
                >
                  <option value="tablets">Tablets</option>
                  <option value="capsules">Capsules</option>
                  <option value="ml">ML</option>
                  <option value="g">Grams</option>
                  <option value="strips">Strips</option>
                </select>
              </div>
              <button
                onClick={handleAddMedicine}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg"
              >
                Add Medicine
              </button>
            </div>

            {/* Medicines Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">
                      Medicine Name
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">
                      Unit
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">
                      Price
                    </th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((medicine) => (
                    <tr
                      key={medicine.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {medicine.name}
                          </p>
                          {medicine.aliases &&
                            medicine.aliases.length > 0 && (
                              <p className="text-sm text-gray-600">
                                {medicine.aliases.join(", ")}
                              </p>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          value={medicine.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(
                              medicine.id,
                              e.target.value
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        {medicine.unit}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-700">
                        ₹{medicine.price?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === "deliveries" && (
          <div>
            {/* Add Delivery Form */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Delivery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={newDelivery.customerName}
                  onChange={(e) =>
                    setNewDelivery({
                      ...newDelivery,
                      customerName: e.target.value,
                    })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900 placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={newDelivery.address}
                  onChange={(e) =>
                    setNewDelivery({
                      ...newDelivery,
                      address: e.target.value,
                    })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900 placeholder-gray-500"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newDelivery.phone}
                  onChange={(e) =>
                    setNewDelivery({
                      ...newDelivery,
                      phone: e.target.value,
                    })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900 placeholder-gray-500"
                />
                <select
                  value={newDelivery.assignedTo}
                  onChange={(e) =>
                    setNewDelivery({
                      ...newDelivery,
                      assignedTo: e.target.value,
                    })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 font-bold text-gray-900"
                >
                  <option value="">Select Delivery Person</option>
                  {deliveryUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Medicines (comma-separated)"
                  value={newDelivery.medicines}
                  onChange={(e) =>
                    setNewDelivery({
                      ...newDelivery,
                      medicines: e.target.value,
                    })
                  }
                  className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 md:col-span-2 font-bold text-gray-900 placeholder-gray-500"
                />
              </div>
              <button
                onClick={handleAddDelivery}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg"
              >
                Create Delivery
              </button>
            </div>

            {/* Filter */}
            <div className="mb-6 flex gap-4">
              {["All", "Pending", "Delivered", "Unavailable"].map((status) => (
                <button
                  key={status}
                  onClick={() => setDeliveryFilter(status)}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    deliveryFilter === status
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-600"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Deliveries List */}
            <div className="space-y-4">
              {filteredDeliveries.length === 0 && (
                <div className="text-center text-gray-600 py-8 bg-white rounded-lg">
                  No deliveries found
                </div>
              )}

              {filteredDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">
                        CUSTOMER
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {delivery.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">
                        ADDRESS
                      </p>
                      <p className="text-lg text-gray-700">{delivery.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">
                        STATUS
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-lg font-bold ${
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medicine Requests Tab */}
        {activeTab === "requests" && (
          <div>
            {/* Filter */}
            <div className="mb-6 flex gap-4 flex-wrap">
              {["All", "Pending", "Assigned", "Delivered", "Rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setRequestFilter(status)}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    requestFilter === status
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-600"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Requests List */}
            <div className="space-y-4">
              {filteredRequests.length === 0 && (
                <div className="text-center text-gray-600 py-8 bg-white rounded-lg">
                  No medicine requests found
                </div>
              )}

              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-800 font-bold">
                        DOCTOR
                      </p>
                      <p className="text-lg font-bold text-gray-900">{request.doctorEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-bold">
                        PATIENT
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {request.patientName}
                      </p>
                      <p className="text-gray-900 text-sm font-semibold">{request.patientPhone}</p>
                    </div>
                  </div>

                  {/* Medicines */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="font-bold text-gray-900 mb-2 text-base">Medicines:</p>
                      <ul className="text-gray-900 text-sm space-y-1 font-semibold">
                      {request.medicines.map((med) => (
                        <li key={med.medicineName}>
                          • {med.medicineName} - {med.quantity} units
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span
                      className={`px-3 py-1 rounded-lg font-bold inline-block ${
                        request.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : request.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "Assigned"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status}
                    </span>

                    {request.status === "Pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                        >
                          🚚 Assign to Delivery
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateRequestStatus(request.id, "Rejected")
                          }
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assignment Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Assign Medicine Request
              </h3>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 font-semibold">PATIENT</p>
                <p className="text-lg font-bold text-gray-900">
                  {selectedRequest.patientName}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedRequest.medicines.map((m) => m.medicineName).join(", ")}
                </p>
              </div>

              <select
                value={selectedDeliveryBoy}
                onChange={(e) => setSelectedDeliveryBoy(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 mb-6"
              >
                <option value="">Select Delivery Boy</option>
                {deliveryUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <button
                  onClick={handleAssignToDelivery}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
                >
                  Assign
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setSelectedDeliveryBoy("");
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Medicines */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  TOTAL MEDICINES
                </p>
                <p className="text-5xl font-bold text-blue-600">
                  {totalMedicines}
                </p>
              </div>

              {/* Low Stock Alert */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  LOW STOCK ALERT
                </p>
                <p className="text-5xl font-bold text-red-600">
                  {lowStockCount}
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  Medicines with less than 10 units
                </p>
              </div>

              {/* Today's Delivery Progress */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  TODAY'S PROGRESS
                </p>
                <p className="text-5xl font-bold text-green-600">
                  {todayDeliveredCount}/{deliveries.length}
                </p>
                <p className="text-gray-600 text-sm mt-2">Deliveries completed</p>
              </div>
            </div>

            {/* Low Stock Medicines */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Low Stock Medicines
              </h2>
              <div className="space-y-3">
                {medicines
                  .filter((m) => m.quantity < 10)
                  .map((medicine) => (
                    <div
                      key={medicine.id}
                      className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-600"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {medicine.name}
                        </p>
                        <p className="text-gray-600 text-sm">
                          Only {medicine.quantity} {medicine.unit} left
                        </p>
                      </div>
                      <span className="text-red-600 font-bold text-lg">
                        ⚠️
                      </span>
                    </div>
                  ))}
                {medicines.filter((m) => m.quantity < 10).length === 0 && (
                  <p className="text-gray-600 text-center py-4">
                    No low stock items
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminDashboardContent />
    </RoleGuard>
  );
}
