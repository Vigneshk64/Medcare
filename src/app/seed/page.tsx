"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

const medicines = [
  { name: "Aspirin", aliases: ["Headache", "Pain Relief"], quantity: 500, price: 250, unit: "tablets" },
  { name: "Paracetamol", aliases: ["Crocin", "Acetaminophen"], quantity: 800, price: 150, unit: "tablets" },
  { name: "Ibuprofen", aliases: ["Brufen"], quantity: 300, price: 180, unit: "tablets" },
  { name: "Amoxicillin", aliases: ["Antibiotic"], quantity: 200, price: 450, unit: "capsules" },
  { name: "Metformin", aliases: ["Diabetes"], quantity: 1200, price: 120, unit: "tablets" },
  { name: "Lisinopril", aliases: ["BP Medicine"], quantity: 400, price: 220, unit: "tablets" },
  { name: "Atorvastatin", aliases: ["Cholesterol"], quantity: 350, price: 280, unit: "tablets" },
  { name: "Omeprazole", aliases: ["Acid Reflux", "Stomach"], quantity: 600, price: 160, unit: "capsules" },
  { name: "Cetirizine", aliases: ["Allergy", "Itching"], quantity: 500, price: 120, unit: "tablets" },
  { name: "Salbutamol Inhaler", aliases: ["Asthma"], quantity: 80, price: 450, unit: "inhalers" },
  { name: "Azithromycin", aliases: ["Z-Pack", "Antibiotic"], quantity: 150, price: 380, unit: "tablets" },
  { name: "Ciprofloxacin", aliases: ["Infection"], quantity: 180, price: 320, unit: "tablets" },
  { name: "Metoprolol", aliases: ["Heart Beat"], quantity: 420, price: 190, unit: "tablets" },
  { name: "Vitamin D3", aliases: ["Calcium", "Bones"], quantity: 2000, price: 80, unit: "tablets" },
  { name: "Insulin Injection", aliases: ["Diabetes Injection"], quantity: 50, price: 500, unit: "units" },
  { name: "Cough Syrup", aliases: ["Cold", "Cough"], quantity: 300, price: 120, unit: "ml" },
  { name: "Dextromethorphan", aliases: ["Cold Tablet"], quantity: 400, price: 110, unit: "tablets" },
  { name: "Ranitidine", aliases: ["Indigestion"], quantity: 550, price: 140, unit: "tablets" },
  { name: "Levothyroxine", aliases: ["Thyroid"], quantity: 300, price: 200, unit: "tablets" },
  { name: "Enalapril", aliases: ["Blood Pressure"], quantity: 480, price: 210, unit: "tablets" },
];

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    setStatus("Adding medicines...");

    try {
      for (const med of medicines) {
        await addDoc(collection(db, "medicines"), {
          name: med.name,
          aliases: med.aliases,
          quantity: med.quantity,
          price: med.price,
          unit: med.unit,
        });
      }
      setStatus("✅ All 20 medicines added successfully!");
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Seed Data</h1>
        <p className="text-gray-600 mb-6">
          Click below to add 20 dummy medicines to Firebase.
        </p>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg mb-4"
        >
          {loading ? "Adding..." : "Add 20 Medicines"}
        </button>

        {status && (
          <div className="p-4 bg-gray-50 rounded text-sm text-gray-700 font-mono">
            {status}
          </div>
        )}

        <p className="text-gray-500 text-xs mt-6">
          After adding, visit localhost:3000/admin to verify
        </p>
      </div>
    </div>
  );
}
