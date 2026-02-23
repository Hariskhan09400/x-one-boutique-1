import { useState, useEffect } from "react"; // useEffect add kiya
import { CartItem } from "../types";
import { useNavigate } from "react-router-dom";
import { Instagram, MessageCircle, Mail } from "lucide-react";

interface CheckoutProps {
  cart: CartItem[];
  onClearCart: () => void;
}

const CheckoutPage = ({ cart, onClearCart }: CheckoutProps) => {
  const navigate = useNavigate();

  // --- STEP 2: AUTH GUARD LOGIC ---
  useEffect(() => {
    const token = localStorage.getItem("token"); // Token check kar rahe hain
    if (!token) {
      alert("Bhai, checkout karne ke liye pehle login toh kar lo! 😅");
      navigate("/login"); // Login page par redirect
    }
  }, [navigate]);

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

  const getOrderMessage = (isEmail: boolean) => {
    const lineBreak = isEmail ? "%0D%0A" : "\n";
    let message = `🛒 New Order${lineBreak}${lineBreak}`;
    message += `👤 Name: ${form.name}${lineBreak}`;
    message += `📞 Phone: ${form.phone}${lineBreak}`;
    message += `🏠 Address: ${form.address}, ${form.city} - ${form.pincode}${lineBreak}${lineBreak}`;
    message += `📦 Order Items${lineBreak}`;
    cart.forEach((item) => {
      message += `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}${lineBreak}`;
    });
    message += `${lineBreak}💰 Total: ₹${total}`;
    return message;
  };

  const validateForm = () => {
    // Basic check pehle se hai
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      alert("Please fill all details");
      return false;
    }
    if (cart.length === 0) {
      alert("Cart is empty");
      return false;
    }
    return true;
  };

  const handleWhatsAppSubmit = () => {
    if (!validateForm()) return;
    const message = getOrderMessage(false);
    window.open(`https://wa.me/917208428589?text=${encodeURIComponent(message)}`, "_blank");
    onClearCart();
    navigate("/");
  };

  const handleInstagramSubmit = () => {
    if (!validateForm()) return;
    alert("Opening Instagram... Please DM us your order details!");
    window.open(`https://www.instagram.com/xoneboutique.in?igsh=MXB6ZjAydnd3dXRyZw==`, "_blank");
  };

  const handleEmailSubmit = () => {
    if (!validateForm()) return;
    const subject = `New Order from ${form.name}`;
    const body = getOrderMessage(true);
    const mailtoLink = `mailto:xoneboutique.official@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailtoLink;
    onClearCart();
    navigate("/");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      {/* FORM SECTION */}
      <div className="bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-800 text-white">
        <h1 className="text-3xl font-bold mb-6 tracking-tighter italic">
          Checkout Details
        </h1>

        <div className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none transition-all"
          />

          <input
            name="phone"
            type="tel"
            placeholder="Phone Number"
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none transition-all"
          />

          <textarea
            name="address"
            placeholder="Full Address"
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none transition-all h-24"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              name="city"
              placeholder="City"
              onChange={handleChange}
              className="p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none transition-all"
            />
            <input
              name="pincode"
              placeholder="Pincode"
              onChange={handleChange}
              className="p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="pt-6 space-y-3">
            <button
              onClick={handleWhatsAppSubmit}
              className="w-full bg-green-600 hover:bg-green-700 transition-all py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageCircle size={22} />
              Confirm on WhatsApp
            </button>

            <button
              onClick={handleInstagramSubmit}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 transition-all py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg"
            >
              <Instagram size={22} />
              Confirm on Instagram
            </button>

            <button
              onClick={handleEmailSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg"
            >
              <Mail size={22} />
              Confirm via Email
            </button>
          </div>
        </div>
      </div>

      {/* ORDER SUMMARY SECTION */}
      <div className="bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-800 text-white flex flex-col h-fit">
        <h2 className="text-2xl font-bold mb-6 tracking-tighter italic text-gray-400">
          Order Summary
        </h2>

        {cart.length === 0 ? (
          <p className="text-gray-400 italic">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4 text-gray-300">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-gray-800/40 p-4 rounded-2xl border border-gray-800"
                >
                  <span className="font-semibold text-sm">
                    {item.name} <span className="text-blue-500 ml-1">x{item.quantity}</span>
                  </span>
                  <span className="font-black text-white">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-800 mt-8 pt-6 flex justify-between text-2xl font-black">
              <span className="text-gray-500 uppercase text-sm self-center tracking-widest">Grand Total</span>
              <span className="text-white">₹{total}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;