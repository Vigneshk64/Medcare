"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

// ---------------------------------------------------
//  Modern CSS for animations and glassmorphism effects
// ---------------------------------------------------
const style = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(232, 93, 4, 0.5); }
    50% { box-shadow: 0 0 40px rgba(232, 93, 4, 0.8); }
  }
  .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
  .animate-slide-in-down { animation: slideInDown 0.5s ease-out; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-glow { animation: glow 2s ease-in-out infinite alternate; }
  .placeholder-pulse::placeholder { animation: pulse 2s infinite; }
  .glass-card {
    background: rgba(26, 26, 46, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(232, 93, 4, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
  .glass-card:hover {
    border-color: rgba(232, 93, 4, 0.4);
    box-shadow: 0 8px 32px rgba(232, 93, 4, 0.2);
  }
  .gradient-glow {
    background: linear-gradient(135deg, rgba(232, 93, 4, 0.1) 0%, rgba(232, 93, 4, 0.05) 100%);
    border: 1px solid rgba(232, 93, 4, 0.2);
  }
  .orange-gradient {
    background: linear-gradient(135deg, #e85d04 0%, #ff6b1a 100%);
  }
  .orange-gradient-hover {
    background: linear-gradient(135deg, #ff6b1a 0%, #e85d04 100%);
  }
`;

export default function ElderlyHomePage() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

    // Lazy load AI Assistant to avoid loading it on initial page load
  const AIAssistant = dynamic(() => import("./components/AIAssistant"), {
    ssr: false,
  });

  // ---------------------------------------------------
  //  Fetch medicines from Firestore – keep unchanged
  // ---------------------------------------------------
  useEffect(() => {
    const fetchMedicines = async () => {
      const snapshot = await getDocs(collection(db, "medicines"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMedicines(data);
      setLoading(false);
    };
    fetchMedicines();
  }, []);

    // ---------------------------------------------------
  //  Fuzzy search (by name or alias) - using useMemo to avoid setState in effect
  // ---------------------------------------------------
  const featuredMedicines = useMemo(() => medicines.slice(0, 6), [medicines]);

  const results = useMemo(() => {
    if (!search.trim()) {
      return featuredMedicines;
    }
    const q = search.toLowerCase();
    return medicines.filter((med) => {
      const nameMatch = med.name?.toLowerCase().includes(q);
      const aliasMatch = med.aliases?.some((a) => a.toLowerCase().includes(q));
      return nameMatch || aliasMatch;
    });
  }, [search, medicines, featuredMedicines]);

  // ---------------------------------------------------
  //  Statistics helpers
  // ---------------------------------------------------
  const totalMedicines = medicines.length;
  const inStockCount = medicines.filter((m) => m.quantity && m.quantity > 0).length;
  const categories = Array.from(new Set(medicines.map((m) => m.type || "Other")));

  // ---------------------------------------------------
  //  Emoji fallback based on medicine type
  // ---------------------------------------------------
  const typeEmoji = (type) => {
    if (!type) return "💊";
    const t = type.toLowerCase();
    if (t.includes("capsule")) return "💊";
    if (t.includes("tablet")) return "💊";
    if (t.includes("syrup")) return "🥤";
    if (t.includes("inhaler")) return "🌬️";
    return "💊";
  };

  return (
    <>
      {/* Global custom styles */}
      <style>{style}</style>

      {/* --------------------------------------------------- */}
      {/*  HERO SECTION – dark theme with orange glow */}
      {/* --------------------------------------------------- */}
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex flex-col items-center justify-center px-6 py-8 sm:py-12">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0">
          {[/* particles array */].map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-500 rounded-full animate-float"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto">
          {/* Header with Animation */}
          <div className="text-center mb-12 sm:mb-16 animate-slide-in-down">
            <div className="inline-block mb-6 px-6 py-3 glass-card rounded-full">
              <p className="text-sm font-semibold text-orange-400">Healthcare Management System</p>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent mb-4 animate-glow">
              MedCare
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 font-light max-w-2xl mx-auto">
              Intelligent pharmacy management with AI-powered assistance
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
                className="placeholder-pulse w-full px-8 py-4 text-lg sm:text-xl glass-card rounded-2xl font-medium text-white placeholder-gray-400 bg-transparent focus:outline-none focus:border-orange-500 transition-all duration-300"
                suppressHydrationWarning
              />
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-orange-400">
                🔍
              </div>
            </div>
          </div>

        {/* Featured/Results Section */}
        <div className="w-full max-w-4xl">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {!loading && (
            <>
              {!search && (
                <div className="mb-10 animate-fade-in-up text-center sm:text-left" style={{ animationDelay: "0.3s" }}>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Featured Medicines</h2>
                  <p className="text-gray-400">Popular medicines available in stock</p>
                </div>
              )}

              {search && (
                <div className="mb-6 animate-fade-in-up text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-white">
                    Search Results ({results.length})
                  </h2>
                </div>
              )}

              {search && results.length === 0 && (
                <div className="text-center py-12 animate-fade-in-up">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-white text-xl">No medicines found</p>
                  <p className="text-gray-400">Try searching for a different medicine name</p>
                </div>
              )}

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((medicine, idx) => (
                  <div
                    key={medicine.id}
                    className="glass-card rounded-3xl p-6 sm:p-8 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 animate-fade-in-up"
                    style={{ animationDelay: `${0.1 * idx}s` }}
                  >
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl sm:text-2xl font-bold text-white flex-1">
                        {typeEmoji(medicine.type)} {medicine.name}
                      </h2>
                      {medicine.quantity && medicine.quantity > 0 ? (
                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full ml-2 whitespace-nowrap border border-green-500/30">
                          In Stock
                        </span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full ml-2 whitespace-nowrap border border-red-500/30">
                          Out
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-5">
                      {medicine.quantity !== undefined && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Available Quantity:</span>
                          <span className="font-bold text-orange-400">{medicine.quantity} units</span>
                        </div>
                      )}
                      {medicine.dosage && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Dosage:</span>
                          <span className="font-bold text-white">{medicine.dosage}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Button */}
                    <div className="pt-4 border-t border-gray-700">
                      {medicine.quantity && medicine.quantity > 0 ? (
                        <div className="flex items-center gap-2 text-green-400 font-semibold">
                          <span className="text-xl">✓</span>
                          <span>Available for delivery</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400 font-semibold">
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
          <div className="mt-16 sm:mt-24 text-center w-full border-t border-gray-800 pt-12 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <p className="text-gray-300 text-lg mb-6">Health professional?</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 orange-gradient text-white font-bold py-3 px-8 rounded-xl orange-gradient-hover transition-all duration-300 transform hover:scale-105 shadow-lg animate-glow"
            >
              Sign in as Doctor or Staff
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Chatbot Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="orange-gradient text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all hover:scale-110 transform focus:outline-none animate-glow"
          suppressHydrationWarning
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>

      {/* AI Chatbot Drawer */}
      {chatOpen && (
        <div className="fixed inset-0 pointer-events-none z-50 flex justify-end">
          <div className="fixed right-0 top-0 h-full w-full max-w-md pointer-events-auto">
            <div className="h-full bg-black/80 backdrop-blur-xl border-l border-orange-500/20 shadow-2xl flex flex-col">
              <div className="p-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">MedCare AI Assistant</h3>
                  <p className="text-xs text-orange-100">Ask about medicines & interactions</p>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-white hover:text-orange-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <AIAssistant type="general" />
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

