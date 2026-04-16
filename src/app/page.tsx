"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const style = `
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

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  .animate-slide-in-down {
    animation: slideInDown 0.6s ease-out;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .medicine-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .medicine-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
  }

  .search-input {
    transition: all 0.3s ease;
  }

  .search-input:focus {
    transform: scale(1.02);
  }
`;

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
      // Show first 6 featured medicines if no search
      setResults(medicines.slice(0, 6));
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
    <>
      <style>{style}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-start px-6 py-8 sm:py-12">
        {/* Header with Animation */}
        <div className="text-center mb-12 sm:mb-16 animate-slide-in-down">
          <div className="inline-block mb-4 px-6 py-2 bg-blue-100 rounded-full">
            <p className="text-sm font-semibold text-blue-600">Healthcare Management</p>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            MedCare
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-light">
            Find and check medicine availability instantly
          </p>
        </div>

        {/* Search Bar with Animation */}
        <div className="w-full max-w-2xl mb-12 sm:mb-16 animate-fade-in-up" style={{ animationDelay: "0.2s" }} suppressHydrationWarning>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input w-full px-8 py-4 text-lg sm:text-xl border-2 border-blue-200 rounded-2xl shadow-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200 font-medium text-gray-900 placeholder-gray-400 bg-white"
              suppressHydrationWarning
            />
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>

        {/* Featured/Results Section */}
        <div className="w-full max-w-4xl">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && (
            <>
              {!search && (
                <div className="mb-10 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Featured Medicines</h2>
                  <p className="text-gray-500">Popular medicines available in stock</p>
                </div>
              )}

              {search && (
                <div className="mb-6 animate-fade-in-up">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Search Results ({results.length})
                  </h2>
                </div>
              )}

              {search && results.length === 0 && (
                <div className="text-center py-12 animate-fade-in-up">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-600 text-xl">No medicines found</p>
                  <p className="text-gray-400">Try searching for a different medicine name</p>
                </div>
              )}

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((medicine, idx) => (
                  <div
                    key={medicine.id}
                    className="medicine-card bg-white border-2 border-gray-200 rounded-3xl p-6 sm:p-8 shadow-md hover:shadow-xl animate-fade-in-up"
                    style={{ animationDelay: `${0.1 * idx}s` }}
                  >
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 flex-1">
                        {medicine.name}
                      </h2>
                      {medicine.quantity && medicine.quantity > 0 ? (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full ml-2 whitespace-nowrap">
                          In Stock
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full ml-2 whitespace-nowrap">
                          Out
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-5">
                      {medicine.quantity && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Available Quantity:</span>
                          <span className="font-bold text-gray-900">{medicine.quantity} units</span>
                        </div>
                      )}
                      {medicine.dosage && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Dosage:</span>
                          <span className="font-bold text-gray-900">{medicine.dosage}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Button */}
                    <div className="pt-4 border-t border-gray-200">
                      {medicine.quantity && medicine.quantity > 0 ? (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <span className="text-xl">✓</span>
                          <span>Available for delivery</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-600 font-semibold">
                          <span className="text-xl">✕</span>
                          <span>Currently unavailable</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 sm:mt-24 text-center w-full border-t border-gray-200 pt-12 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-gray-600 text-lg mb-6">Health professional?</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Sign in as Doctor or Staff
            <span>→</span>
          </Link>
        </div>
      </div>
    </>
  );
}
