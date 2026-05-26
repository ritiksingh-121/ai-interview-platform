import { loadStripe } from "@stripe/stripe-js";

export async function handleCheckout(plan) {
  console.log("Clicked plan:", plan);

  const res = await fetch("http://localhost:5000/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      plan,
      userId: "test_user"
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