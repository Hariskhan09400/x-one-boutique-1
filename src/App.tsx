import { useState, useMemo, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom"; 
import { motion, AnimatePresence } from "framer-motion"; 
import toast, { Toaster } from 'react-hot-toast'; 
import UpdatePassword from "./pages/UpdatePassword";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage"; 
import ForgotPassword from "./pages/ForgotPassword"; 
import { MessageCircle, ShoppingCart, X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, CreditCard, User, MapPin, AlertCircle } from 'lucide-react';
import { Product, CartItem } from './types';
import { products } from './data/products';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { Hero } from './components/Hero';
import { ContactForm } from './components/ContactForm';
import ThemeToggle from "./components/ThemeToggle";
import Layout from "./components/Layout";
import Navbar from "./components/Navbar";
import { showOrderSuccessToast } from "../utils/notifications"; // Import
import { supabase } from "./lib/supabase"; 

export const API_URL = import.meta.env.VITE_API_URL || "https://x-one-boutique-backend-production.up.railway.app";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CartSidebar = ({ isCartOpen, setIsCartOpen, cart, updateQuantity, removeItem, clearCart, cartTotal, user }: any) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'cart' | 'contact' | 'address'>('cart');
  const [formData, setFormData] = useState({
    phone: '',
    email: user?.email || '',
    fullName: user?.name || '',
    pincode: '',
    city: '',
    address: '',
    landmark: ''
  });

  useEffect(() => {
    if (!isCartOpen) setTimeout(() => setStep('cart'), 300);
  }, [isCartOpen]);

// --- UPGRADED VALIDATION LOGIC (With Toast ID to prevent multiple popups) ---
const validateAddressData = () => {
  const { pincode, city, fullName, address, landmark } = formData;

  if (!pincode) { 
    toast.error("Please enter your PIN code", { id: 'address-error' }); 
    return false; 
  }
  if (pincode.length !== 6) { 
    toast.error("Please enter a valid 6-digit PIN code.❌", { id: 'address-error' }); 
    return false; 
  }
  
  if (!city) { 
    toast.error("Please enter your city", { id: 'address-error' }); 
    return false; 
  }
  if (city.length > 19) return false; 

  if (!fullName) { 
    toast.error("Please enter your full name.", { id: 'address-error' }); 
    return false; 
  }
  if (!address) { 
    toast.error("Please enter your address.", { id: 'address-error' }); 
    return false; 
  }
  if (!landmark) { 
    toast.error("Please provide a nearby landmark for easier delivery.", { id: 'address-error' }); 
    return false; 
  }

  return true;
};

const handleContinueToAddress = () => {
  const { phone, email } = formData;
  const phoneRegex = /^[0-9]{10}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!phone && !email) {
    toast.error("Contact info is required to continue", { id: 'contact-error' });
    return;
  }
  if (!phone) {
    toast.error("Phone number is required", { id: 'contact-error' });
    return;
  }
  if (!phoneRegex.test(phone)) {
    toast.error("Please enter a valid 10-digit phone number❌", { id: 'contact-error' });
    return;
  }
  if (!email) {
    toast.error("Please enter your email address.", { id: 'contact-error' });
    return;
  }
  if (!emailRegex.test(email)) {
    toast.error("Invalid email format.", { id: 'contact-error' });
    return;
  }

  setStep('address');
};

  const handleProceedToCheckout = () => {
    const savedUser = localStorage.getItem("xob_user");
    
    if (!savedUser) {
      toast.custom((t) => (
        <div 
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 mb-20 border-l-4 border-red-500`}
        >
          <div className="flex-1 w-0">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                  Authentication Required
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Please log in first to continue shopping.🛍️
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.dismiss(t.id); 
              }} 
              className="rounded-md inline-flex text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors p-1 active:scale-90"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ), { 
        id: 'signin-error',
        duration: 2100 
      });
      
      setIsCartOpen(false);
      navigate("/login");
      return;
    }
    setStep('contact');
  };

const handleOnlinePayment = async () => {
    if (!validateAddressData()) return;

    const res = await loadRazorpay();
    if (!res) return toast.error("Razorpay SDK failed to load! ❌");
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return toast.error("Bhai, login session expire ho gaya!");

      const { data: orderData, error: dbError } = await supabase
        .from("orders")
        .insert([{
          user_id: session.user.id,
          full_name: formData.fullName,
          phone: formData.phone,
          address: `${formData.address}, ${formData.landmark}`,
          city: formData.city,
          pincode: formData.pincode,
          total_amount: cartTotal,
          items: cart,
          status: 'awaiting_payment'
        }])
        .select();

      if (dbError) throw dbError;
      const orderId = orderData[0].id;

      const options = {
        key: "rzp_live_SJYY3uYtuUcaHe",
        amount: cartTotal * 100, 
        currency: "INR",
        name: "X ONE BOUTIQUE",
        description: `Order Checkout (${cart.length} items)`,
        prefill: { name: formData.fullName, email: formData.email, contact: formData.phone },
        notes: { address: `${formData.address}, ${formData.city} - ${formData.pincode}` },
        theme: { color: "#2563eb" },
        handler: async function (response: any) {
          // --- DB UPDATE ---
          await supabase
            .from("orders")
            .update({ 
              status: "paid", 
              razorpay_order_id: response.razorpay_payment_id 
            })
            .eq("id", orderId);

          // --- 1. PLAY SUCCESS SOUND ---
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
          audio.play().catch(e => console.log("Sound error:", e));

          // --- 2. PREMIUM GOLD NOTIFICATION ---
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in fade-in zoom-in' : 'animate-out fade-out zoom-out'} max-w-sm w-full bg-[#0a0a0a] border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.4)] rounded-2xl pointer-events-auto flex overflow-hidden ring-1 ring-black ring-opacity-5`}>
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center border border-amber-400/50">
                      <span className="text-white font-black text-[10px]">X1</span>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic mb-1">From X-One Boutique</p>
                    <p className="text-sm font-bold text-white leading-tight">Order Placed Successfully! 🛍️</p>
                    <p className="mt-1 text-[10px] text-slate-400 font-medium italic">Payment confirmed. Your style is on its way!</p>
                    <p className="mt-2 text-[8px] font-mono text-amber-500/60 uppercase">Payment ID: {response.razorpay_payment_id.substring(0,14)}</p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-white/5">
                <button onClick={() => toast.dismiss(t.id)} className="px-4 text-[10px] font-black text-amber-500 uppercase hover:bg-amber-500/5 transition-all">CLOSE</button>
              </div>
            </div>
          ), { duration: 6000, position: 'top-center' });

          // --- 3. CLEANUP & NAVIGATE ---
          clearCart();
          setIsCartOpen(false);
          navigate("/");
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error("Order save nahi hua: " + err.message);
    }
  };

  const handleWhatsAppOrder = async () => {
    if (!validateAddressData()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      await supabase.from("orders").insert([{
        user_id: session?.user.id,
        full_name: formData.fullName,
        phone: formData.phone,
        address: `${formData.address}, ${formData.landmark}`,
        city: formData.city,
        pincode: formData.pincode,
        total_amount: cartTotal,
        items: cart,
        status: 'COD'
      }]);

      const itemsList = cart.map((item: any) => `• ${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}`).join('%0A');
      const message = `*NEW COD ORDER - X ONE BOUTIQUE*%0A%0A*Customer:* ${formData.fullName}%0A*Phone:* ${formData.phone}%0A*Address:* ${formData.address}, ${formData.landmark}, ${formData.city} - ${formData.pincode}%0A%0A*Items:*%0A${itemsList}%0A%0A*Total Amount: ₹${cartTotal}*`;
      
      window.open(`https://wa.me/917208428589?text=${message}`, "_blank");
      clearCart();
      setIsCartOpen(false);
      navigate("/");
    } catch (err: any) {
      toast.error("DB Sync failed but WhatsApp opening...");
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
              <button onClick={() => step === 'address' ? setStep('contact') : step === 'contact' ? setStep('cart') : setIsCartOpen(false)} className="text-slate-400 hover:text-blue-600 transition-all">
                <ArrowRight size={22} className="rotate-180" />
              </button>
              <div className="flex gap-2">
                <div className={`h-1.5 w-6 rounded-full ${step === 'cart' ? 'bg-blue-600' : 'bg-slate-200'}`} />
                <div className={`h-1.5 w-6 rounded-full ${step === 'contact' ? 'bg-blue-600' : 'bg-slate-200'}`} />
                <div className={`h-1.5 w-6 rounded-full ${step === 'address' ? 'bg-blue-600' : 'bg-slate-200'}`} />
              </div>
              <X size={24} className="text-slate-400 cursor-pointer" onClick={() => setIsCartOpen(false)} />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {step === 'cart' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black uppercase italic">Cart Summary</h3>
                  {cart.length === 0 ? (
                    <div className="text-center py-20 opacity-30 italic">
                      <ShoppingBag size={48} className="mx-auto mb-4" />
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    cart.map((item: any) => (
                      <div key={item.id} className="flex gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                        <img src={item.image} className="w-16 h-16 object-cover rounded-xl" />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm dark:text-white">{item.name}</h4>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-blue-600 font-black">₹{item.price}</p>
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg px-2 py-1 shadow-sm">
                              <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                              <span className="font-bold text-sm">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
              {step === 'contact' && (
                <div className="space-y-6">
                  <div className="text-center py-4"><User className="mx-auto text-blue-600 mb-2" /><h3 className="font-black uppercase">Contact Info</h3></div>
                  <input 
                    type="tel" 
                    placeholder="Mobile Number (10 Digits)" 
                    maxLength={10}
                    className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} 
                  />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              )}
              {step === 'address' && (
                <div className="space-y-4">
                  <div className="text-center py-4"><MapPin className="mx-auto text-blue-600 mb-2" /><h3 className="font-black uppercase">Shipping Address</h3></div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="Pincode" 
                      maxLength={6}
                      className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600" 
                      value={formData.pincode} 
                      onChange={(e) => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})} 
                    />
                    <input 
                      placeholder="City" 
                      maxLength={19}
                      className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600" 
                      value={formData.city} 
                      onChange={(e) => setFormData({...formData, city: e.target.value})} 
                    />
                  </div>
                  <input placeholder="Full Name" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                  <textarea placeholder="Address Detail" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none h-20 focus:ring-2 focus:ring-blue-600" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  <input placeholder="Landmark" className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-600" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} />
                </div>
              )}
            </div>

            <div className="p-6 border-t dark:border-slate-800 bg-white dark:bg-slate-900 shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Total Payable</span>
                <span className="text-2xl font-black dark:text-white">₹{cartTotal}</span>
              </div>
              
              {step === 'cart' && (
                <div className="flex flex-col gap-3">
                  <button onClick={handleProceedToCheckout} disabled={cart.length === 0} className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black disabled:opacity-50 transition-all active:scale-95">PROCEED TO CHECKOUT</button>
                  <button onClick={clearCart} disabled={cart.length === 0} className="w-full py-3 border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-20"><Trash2 size={18} /> CLEAR CART</button>
                </div>
              )}

              {step === 'contact' && <button onClick={handleContinueToAddress} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black transition-all active:scale-95">CONTINUE TO ADDRESS</button>}
              {step === 'address' && (
                <div className="space-y-3">
                  <button onClick={handleOnlinePayment} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95"><CreditCard size={18} /> PAY ONLINE</button>
                  <button onClick={handleWhatsAppOrder} className="w-full py-4 border-2 border-green-600 text-green-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-green-50 transition-all active:scale-95"><MessageCircle size={18} /> ORDER VIA WHATSAPP (COD)</button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const savedUser = localStorage.getItem("xob_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("xob_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'pop' | 'low' | 'high' | 'az'>('pop');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const shopRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem("xob_user", JSON.stringify(userData));
    toast.success(`Welcome back, ${userData.name}!`);
  };

 // --- UPGRADED LOGOUT WITH MODAL ---
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    if (!isLogoutModalOpen) {
      setIsLogoutModalOpen(true);
      return;
    }
    // Asli Logout yahan hoga
    setUser(null);
    localStorage.removeItem("xob_user");
    toast.success("Logged out successfully");
    setIsLogoutModalOpen(false);
  };

  // Ye chhota sa component bhi isi ke neeche rakh de taaki confirm box dikhe
  const LogoutConfirmationUI = () => (
    <AnimatePresence>
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogoutModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl p-8 border border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl"><AlertCircle className="text-amber-500" size={28} /></div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">Logout Confirmation</h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-bold">Are you sure you want to do logout?</p>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button onClick={handleLogout} className="flex-1 py-4 bg-[#0284c7] text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-500/30 uppercase text-xs">Confirm</button>
              <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 py-4 border-2 border-slate-100 dark:border-slate-800 text-slate-400 font-black rounded-2xl transition-all active:scale-95 uppercase text-xs">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  useEffect(() => {
    localStorage.setItem("xob_cart", JSON.stringify(cart));
  }, [cart]);

  const handleCategoryClick = (cat: string | null) => {
    setCategoryFilter(cat);
    setTimeout(() => {
      shopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;
    if (categoryFilter && categoryFilter !== 'All') {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }
    const sorted = [...filtered];
    switch (sortBy) {
      case 'low': sorted.sort((a, b) => a.price - b.price); break;
      case 'high': sorted.sort((a, b) => b.price - a.price); break;
      case 'az': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return sorted;
  }, [searchQuery, sortBy, categoryFilter]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart! 🛍️`, {
        position: 'bottom-center'
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      );
      return updated.filter((item) => item.quantity > 0);
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.error("Item removed");
  };

  const clearCart = () => {
    setCart([]);
    toast.error("Cart cleared");
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Router>
      <Toaster 
        position="bottom-center" 
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            marginBottom: '90px', 
            zIndex: 9999
          }
        }}
      /> 

      <Layout cartItemCount={cartItemCount} onCartOpen={() => setIsCartOpen(true)}>
        <Navbar 
          user={user}
          onLogout={() => setIsLogoutModalOpen(true)}
          cartItemCount={cartItemCount} 
          onCartOpen={() => setIsCartOpen(true)}
          onShopClick={() => handleCategoryClick(null)}
          onAboutClick={scrollToAbout}
          themeElement={<ThemeToggle />} 
        />
        <Routes>
          <Route path="/" element={
            <div className="flex flex-col min-h-screen">
              <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                <Hero onCategoryClick={handleCategoryClick} />
                <section ref={shopRef} id="shop" className="mt-4 scroll-mt-24 space-y-12">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none"
                      />
                    </div>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300">
                      <option value="pop">Sort: Popular</option>
                      <option value="low">Price: Low → High</option>
                      <option value="high">Price: High → Low</option>
                      <option value="az">Name: A → Z</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProducts.map(p => (
                      <ProductCard key={p.id} product={p} onAddToCart={addToCart} onOpenModal={setSelectedProduct} />
                    ))}
                  </div>
                </section>
                <div id="contact" className="mt-20">
                  <ContactForm />
                </div>
              </main>
            </div>
          } />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/product/:id" element={<ProductPage onAddToCart={addToCart} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} onClearCart={clearCart} />} />
        </Routes>

        <a href="https://wa.me/917208428589" className="fixed left-3 bottom-4 z-50 bg-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all">
          <MessageCircle size={24} />
        </a>
        
        <button onClick={() => setIsCartOpen(true)} className="fixed right-4 bottom-4 z-50 flex items-center gap-2 px-5 py-4 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 active:scale-95 transition-all">
          <ShoppingCart size={24} />
          {cartItemCount > 0 && <span className="bg-white text-blue-600 px-2 rounded-full text-xs font-black">{cartItemCount}</span>}
        </button>

        <CartSidebar isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} cart={cart} updateQuantity={updateQuantity} removeItem={removeItem} clearCart={clearCart} cartTotal={cartTotal} user={user} />
        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />}
      </Layout>
    </Router>
  );
}

export default App;