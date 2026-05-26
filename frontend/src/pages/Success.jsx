export default function Success() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">
        Payment Successful 🎉
      </h1>

      <p className="text-gray-400 mb-6">
        Your plan has been activated.
      </p>

      <a
        href="/service"
        className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-violet-600"
      >
        Go to Dashboard
      </a>
    </div>
  );
}