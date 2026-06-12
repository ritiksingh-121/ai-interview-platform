import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 pt-24">
      <Card variant="glass" className="p-8 sm:p-12 max-w-md w-full text-center space-y-6 border border-emerald-500/20">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-2xl">
          🎉
        </div>

        <div className="space-y-2">
          <Badge variant="success">Transaction Complete</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Payment Successful!</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Your Pro plan is now active. You have been granted unlimited access to all AI categories, history logs, and priority server responses.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 text-left text-xs text-zinc-400 space-y-2">
          <div className="flex justify-between"><span>Status:</span><span className="text-emerald-400 font-medium">Activated</span></div>
          <div className="flex justify-between"><span>Access level:</span><span className="text-zinc-100 font-medium">Pro Mock Session Suite</span></div>
        </div>

        <Button variant="gradient" onClick={() => navigate("/service")} className="w-full justify-center py-3">Go to Dashboard</Button>
      </Card>
    </div>
  );
}
