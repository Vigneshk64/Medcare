export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-start px-6 py-8 sm:py-12">
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

      <div className="w-full max-w-2xl mb-12 sm:mb-16">
        <p className="text-center text-gray-600 text-lg">Coming Soon...</p>
      </div>
    </div>
  )
}
