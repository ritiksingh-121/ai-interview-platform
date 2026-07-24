import { loadStripe } from "@stripe/stripe-js";
import { auth } from "../firebase";

export async function handleCheckout(plan) {
  const user = auth.currentUser;

  const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const res = await fetch(`${BACKEND_URL}/create-checkout-session`,  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      plan,
      userId: user?.uid || "unknown"
    })
  });

  const data = await res.json();

  console.log("Stripe response:", data);

  if (!data.url) {
    alert("Something went wrong");
    return;
  }

  // ✅ NEW REDIRECT METHOD
  window.location.href = data.url;
}