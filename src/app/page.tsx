"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function ElderlyHomePage() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all medicines from Firestore
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

  // Fuzzy search logic
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

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
          MedCare
        </h1>
        <p className="text-2xl sm:text-3xl text-gray-600 font-light">
          Check Medicine Availability
        </p>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-2xl mb-8 sm:mb-12">
        <input
          type="text"
          placeholder="Type medicine name here"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-6 py-5 text-2xl sm:text-3xl border-2 border-blue-300 rounded-2xl shadow-lg focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-200 font-bold text-gray-900 placeholder-gray-500"
        />
      </div>

      {/* Results */}
      <div className="w-full max-w-2xl">
        {loading && (
          <div className="text-center text-gray-600 text-xl">Loading...</div>
        )}

        {!loading && search && results.length === 0 && (
          <div className="text-center text-gray-600 text-2xl">
            No medicines found. Please try a different name.
          </div>
        )}

        {results.map((medicine) => (
          <div
            key={medicine.id}
            className="bg-white border-2 border-gray-300 rounded-2xl p-6 sm:p-8 mb-5 shadow-md hover:shadow-lg transition"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
              {medicine.name}
            </h2>
            <div className="flex items-center gap-4">
              {medicine.quantity && medicine.quantity > 0 ? (
                <span className="bg-green-600 text-white text-xl sm:text-2xl font-bold px-6 py-3 rounded-xl">
                  ✓ In Stock
                </span>
              ) : (
                <span className="bg-red-600 text-white text-xl sm:text-2xl font-bold px-6 py-3 rounded-xl">
                  ✗ Not Available
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 sm:mt-16 text-center">
        <p className="text-gray-600 text-lg mb-4">Are you a doctor or staff?</p>
        <Link
          href="/login"
          className="text-blue-600 hover:text-blue-800 text-2xl font-semibold underline"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}
