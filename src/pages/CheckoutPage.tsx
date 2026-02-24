//yeh already hai app.tsx me yeh pura code ka function 

import { useState, useEffect } from "react";
import { CartItem } from "../types";
import { useNavigate } from "react-router-dom";
import { Instagram, MessageCircle, Mail, Loader2, CreditCard } from "lucide-react"; 
import { supabase } from "../lib/supabase"; 
import toast from "react-hot-toast";

interface CheckoutProps {
  cart: CartItem[];
  onClearCart: () => void;
}

const CheckoutPage = ({ cart, onClearCart }: CheckoutProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- RAZORPAY SCRIPT LOADER ---
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // --- AUTH GUARD ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Bhai, checkout karne ke liye pehle login toh kar lo! 😅");
        navigate("/login");
      }
    };
    checkUser();
  }, [navigate]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- FIXED SAVING LOGIC ---
  const saveOrderToDb = async (status: string, razorpayId: string | null = null) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User session not found");

    const { data, error } = await supabase.from("orders").insert([
      {
        full_name: form.name,
        phone: form.phone,
        address: form.address,
        pincode: form.pincode,
        city: form.city,
        total_amount: total,
        items: cart,
        status: status,
        user_id: user.id,
        razorpay_order_id: razorpayId, // FIXED: Now correctly handles the ID
      },
    ]).select().single();

    if (error) {
      console.error("Supabase Error Details:", error);
      throw error;
    }
    return data;
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
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      toast.error("Please fill all details");
      return false;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return false;
    }
    return true;
  };

  // --- HANDLERS ---

  const handleWhatsAppSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await saveOrderToDb("pending");
      const message = getOrderMessage(false);
      window.open(`https://wa.me/917208428589?text=${encodeURIComponent(message)}`, "_blank");
      onClearCart();
      navigate("/");
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!validateForm()) return;
    
    const isLoaded = await loadRazorpay();
    if (!isLoaded) {
      toast.error("Razorpay Script load nahi hui!");
      return;
    }

    setLoading(true);

    try {
      // 1. Database mein order create karo (Awaiting payment status)
      const orderEntry = await saveOrderToDb("awaiting_payment");

      // 2. Razorpay Popup Options
      const options = {
        key: "rzp_test_SK6uf37OcJWfG8", 
        amount: total * 100,
        currency: "INR",
        name: "X-One Boutique",
        description: "Payment for your order",
        handler: async function (response: any) {
          // Payment success hone par status aur Razorpay Payment ID update karo
          const { error: updateError } = await supabase
            .from("orders")
            .update({ 
              status: "paid",
              razorpay_order_id: response.razorpay_payment_id 
            })
            .eq("id", orderEntry.id);

          if (updateError) console.error("Update Error:", updateError);
          
          toast.success("Payment Successful! Order Confirmed.");
          onClearCart();
          navigate("/");
        },
        prefill: {
          name: form.name,
          contact: form.phone
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: function() { setLoading(false); }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error("Payment Process Error:", err);
      toast.error("Galti: " + err.message);
      setLoading(false);
    }
  };

  const handleInstagramSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await saveOrderToDb("instagram_pending");
      toast.success("Details saved! Please DM on Instagram.");
      window.open(`https://www.instagram.com/xoneboutique.in?igsh=MXB6ZjAydnd3dXRyZw==`, "_blank");
    } catch (error: any) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      <div className="bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-800 text-white">
        <h1 className="text-3xl font-bold mb-6 tracking-tighter italic">Checkout Details</h1>
        <div className="space-y-4">
          <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none transition-all" />
          <input name="phone" type="tel" placeholder="Phone Number" onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none transition-all" />
          <textarea name="address" placeholder="Full Address" onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none transition-all h-24" />
          <div className="grid grid-cols-2 gap-4">
            <input name="city" placeholder="City" onChange={handleChange} className="p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none transition-all" />
            <input name="pincode" placeholder="Pincode" onChange={handleChange} className="p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none transition-all" />
          </div>

          <div className="pt-6 space-y-3">
            <button onClick={handleWhatsAppSubmit} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-all py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg">
              {loading ? <Loader2 className="animate-spin" /> : <MessageCircle size={22} />}
              Confirm on WhatsApp (COD)
            </button>

            <button onClick={handleOnlinePayment} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg">
              {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={22} />}
              Pay Online Now
            </button>

            <button onClick={handleInstagramSubmit} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 disabled:opacity-50 transition-all py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg">
              {loading ? <Loader2 className="animate-spin" /> : <Instagram size={22} />}
              Confirm on Instagram
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-8 rounded-3xl shadow-xl border border-gray-800 text-white flex flex-col h-fit">
        <h2 className="text-2xl font-bold mb-6 tracking-tighter italic text-gray-400">Order Summary</h2>
        {cart.length === 0 ? (
          <p className="text-gray-400 italic">Your cart is empty</p>
        ) : (
          <>
            <div className="space-y-4 text-gray-300">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-800/40 p-4 rounded-2xl border border-gray-800">
                  <span className="font-semibold text-sm">{item.name} <span className="text-blue-500 ml-1">x{item.quantity}</span></span>
                  <span className="font-black text-white">₹{item.price * item.quantity}</span>
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