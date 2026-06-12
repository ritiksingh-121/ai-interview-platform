import React from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { useNavigate } from "react-router-dom";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-darkbg text-white flex flex-col items-center justify-center p-6 relative selection:bg-accent-500/30">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-success-light/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Card variant="glass" className="p-8 sm:p-12 max-w-md w-full text-center space-y-6 shadow-2xl relative border-success-500/20">
        <div className="w-16 h-16 rounded-full bg-success-light/10 border border-success-500/25 flex items-center justify-center mx-auto text-success-light text-2xl animate-scale-in">
          🎉
        </div>

        <div className="space-y-2">
          <Badge variant="success">Transaction Complete</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Payment Successful!
          </h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Your Pro plan is now active. You have been granted unlimited access to all AI categories, history logs, and priority server responses.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 text-left text-xs text-white/40 space-y-2">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-success-light font-bold">Activated</span>
          </div>
          <div className="flex justify-between">
            <span>Access level:</span>
            <span className="text-white/80 font-bold">Pro Mock Session Suite</span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate("/service")}
          className="w-full justify-center py-3"
        >
          Go to Dashboard
        </Button>
      </Card>
    </div>
  );
}