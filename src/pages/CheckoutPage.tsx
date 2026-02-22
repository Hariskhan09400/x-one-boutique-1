import { useState } from "react";
import { CartItem } from "../types";
import { useNavigate } from "react-router-dom";

interface CheckoutProps {
  cart: CartItem[];
  onClearCart: () => void;
}

const CheckoutPage = ({ cart, onClearCart }: CheckoutProps) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.pincode
    ) {
      alert("Please fill all details");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    let message = `🛒 *New Order*\n\n`;
    message += `👤 Name: ${form.name}\n`;
    message += `📞 Phone: ${form.phone}\n`;
    message += `🏠 Address: ${form.address}, ${form.city} - ${form.pincode}\n\n`;
    message += `📦 *Order Items*\n`;

    cart.forEach((item) => {
      message += `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}\n`;
    });

    message += `\n💰 *Total:* ₹${total}`;

    window.open(
      `https://wa.me/917208428589?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    onClearCart();
    navigate("/");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">

      {/* FORM */}
      <div className="bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-800 text-white">
        <h1 className="text-3xl font-bold mb-6">
          Checkout Details
        </h1>

        <div className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none"
          />

          <input
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none"
          />

          <textarea
            name="address"
            placeholder="Full Address"
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              name="city"
              placeholder="City"
              onChange={handleChange}
              className="p-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none"
            />
            <input
              name="pincode"
              placeholder="Pincode"
              onChange={handleChange}
              className="p-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 transition-all py-3 rounded-xl font-bold text-lg mt-4"
          >
            Confirm Order on WhatsApp
          </button>
        </div>
      </div>

      {/* ORDER SUMMARY */}
      <div className="bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-800 text-white">
        <h2 className="text-2xl font-bold mb-6">
          Order Summary
        </h2>

        {cart.length === 0 ? (
          <p className="text-gray-400">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4 text-gray-300">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 mt-6 pt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <div className="mt-4 text-sm text-green-400">
              🚚 Free Delivery | 🔁 7 Days Easy Return
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;