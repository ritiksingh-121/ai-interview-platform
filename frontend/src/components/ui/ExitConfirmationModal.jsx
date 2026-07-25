import Button from "./Button";

export default function ExitConfirmationModal({ isOpen, onContinue, onExit }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-6 text-center space-y-6">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">Are you sure you want to exit?</h2>
          <p className="text-sm text-zinc-400">
            Your current progress may be lost if not saved.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onContinue} className="flex-1 justify-center">
            Continue
          </Button>
          <Button variant="danger" onClick={onExit} className="flex-1 justify-center">
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
