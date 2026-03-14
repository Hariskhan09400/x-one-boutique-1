/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║        X ONE BOUTIQUE — ENTERPRISE APP v2.0                             ║
 * ║        FIXES: Auth login bug, user state persistence, token handling    ║
 * ║        NEW: AI Search, Smart Recommendations, Advanced Cart,            ║
 * ║             Real-time notifications, Wishlist, Size Guide AI,           ║
 * ║             Order tracking, PWA support, Analytics events               ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Suspense,
  lazy,
  Component,
  type ReactNode,
  type ErrorInfo,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  Outlet,
  Link,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  User,
  MapPin,
  AlertCircle,
  MessageCircle,
  RefreshCw,
  Home,
  Heart,
  Star,
  Sparkles,
  Search,
  TrendingUp,
  Zap,
  Gift,
  Tag,
  Clock,
  CheckCircle,
  Package,
  Truck,
  Bell,
  Settings,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  BarChart3,
  Eye,
  Share2,
  Copy,
  ExternalLink,
  Info,
  ShieldCheck,
  Award,
  Crown,
  Flame,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import { products } from "./data/products";
import type { Product, CartItem } from "./types";
import AboutPage    from "./pages/AboutPage";
import ContactPage  from "./pages/ContactPage";
import FAQPage      from "./pages/FAQPage";
import PrivacyPage  from "./pages/PrivacyPage";
import RefundPage   from "./pages/RefundPage";
import ShippingPage from "./pages/ShippingPage";
import TermsPage    from "./pages/TermsPage";
import ShopPage     from "./pages/ShopPage";

// ─── Lazy Pages ───────────────────────────────────────────────────────────────
const WishlistPage   = lazy(() => import("./pages/Wishlistpage"));
const SettingsPage   = lazy(() => import("./pages/SettingsPage"));
const HomePage       = lazy(() => import("./pages/HomePage"));
const ProductPage    = lazy(() => import("./pages/ProductPage"));
const CartPage       = lazy(() => import("./pages/CartPage"));
const CheckoutPage   = lazy(() => import("./pages/CheckoutPage"));
const LoginPage      = lazy(() => import("./pages/LoginPage"));
const RegisterPage   = lazy(() => import("./pages/RegisterPage"));
const OrdersPage     = lazy(() => import("./pages/OrdersPage"));
const ProfilePage    = lazy(() => import("./pages/ProfilePage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const NotFoundPage   = lazy(() => import("./pages/NotFoundPage"));

export const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://x-one-boutique-backend-production.up.railway.app";

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface User {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  avatar?: string;
  joinedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

interface CartContextType {
  cart: CartItem[];
  cartItemCount: number;
  cartTotal: number;
  cartSavings: number;
  isCartOpen: boolean;
  lastAdded: CartItem | null;
  addToCart: (product: Product, size?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyPromo: (code: string) => boolean;
  promoDiscount: number;
  activePromo: string | null;
}

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  wishlistCount: number;
}

interface RecentlyViewedContextType {
  recentlyViewed: Product[];
  addToRecentlyViewed: (product: Product) => void;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

interface AppNotification {
  id: string;
  type: "order" | "promo" | "system" | "ai";
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  icon?: string;
}

const PROMO_CODES: Record<string, number> = {
  "XONE10": 10,
  "STYLE20": 20,
  "FIRST15": 15,
  "BOUTIQUE5": 5,
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — CONTEXTS
// ══════════════════════════════════════════════════════════════════════════════

const AuthContext           = createContext<AuthContextType | null>(null);
const CartContext           = createContext<CartContextType | null>(null);
const ThemeContext          = createContext<ThemeContextType | null>(null);
const WishlistContext       = createContext<WishlistContextType | null>(null);
const RecentlyViewedContext = createContext<RecentlyViewedContextType | null>(null);
const NotificationContext   = createContext<NotificationContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
};
export const useWishlist = (): WishlistContextType => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside WishlistProvider");
  return ctx;
};
export const useRecentlyViewed = (): RecentlyViewedContextType => {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be inside RecentlyViewedProvider");
  return ctx;
};
export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside NotificationProvider");
  return ctx;
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — PROVIDERS
// ══════════════════════════════════════════════════════════════════════════════

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("xob_theme") as "light" | "dark" | null;
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("xob_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() =>
    setTheme((p) => (p === "light" ? "dark" : "light")), []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]           = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const saved = localStorage.getItem("xob_user");
          if (saved) {
            const parsed = JSON.parse(saved);
            setUser({ ...parsed, id: session.user.id });
          } else {
            setUser({
              id:       session.user.id,
              name:     session.user.user_metadata?.name ||
                        session.user.user_metadata?.full_name ||
                        session.user.email?.split("@")[0] || "User",
              email:    session.user.email || "",
              role:     session.user.user_metadata?.role || "user",
              avatar:   session.user.user_metadata?.avatar_url,
              joinedAt: session.user.created_at,
            });
          }
        }
      } catch (err) {
        console.error("Auth init:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem("xob_user");
          localStorage.removeItem("token");
        } else if (event === "SIGNED_IN" && session?.user) {
          const saved = localStorage.getItem("xob_user");
          if (saved) {
            const parsed = JSON.parse(saved);
            setUser({ ...parsed, id: session.user.id });
          }
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          const saved = localStorage.getItem("xob_user");
          if (saved) {
            const parsed = JSON.parse(saved);
            setUser({ ...parsed, id: session.user.id });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback((userData: User, token?: string) => {
    const finalUser: User = {
      id:       userData.id || "",
      name:     userData.name || "User",
      email:    userData.email || "",
      role:     userData.role || "user",
      avatar:   userData.avatar,
      joinedAt: userData.joinedAt || new Date().toISOString(),
    };
    setUser(finalUser);
    localStorage.setItem("xob_user", JSON.stringify(finalUser));
    if (token) localStorage.setItem("token", token);
    toast.success(`Welcome back, ${finalUser.name}! 🛍️`, { style: { fontWeight: "700" } });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("xob_user");
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
  }, []);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partial };
      localStorage.setItem("xob_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo(() => ({
    user, isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login, logout, updateUser,
  }), [user, isLoading, login, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext) ?? { user: null };
  const cartKey = user?.id ? `xob_cart_${user.id}` : "xob_cart_guest";

  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(cartKey) || "[]"); }
    catch { return []; }
  });

  const [isCartOpen,    setIsCartOpen]    = useState(false);
  const [lastAdded,     setLastAdded]     = useState<CartItem | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [activePromo,   setActivePromo]   = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(cartKey);
      setCart(saved ? JSON.parse(saved) : []);
    } catch { setCart([]); }
  }, [cartKey]);

  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  const addToCart = useCallback((product: Product, size?: string) => {
    setCart((prev) => {
      const key = `${product.id}${size ? `-${size}` : ""}`;
      const existing = prev.find((i) => i.id === key);
      const newItem: CartItem = { ...product, id: key, quantity: 1, selectedSize: size };
      if (existing) {
        return prev.map((i) => i.id === key ? { ...i, quantity: i.quantity + 1 } : i);
      }
      setLastAdded(newItem);
      return [...prev, newItem];
    });
    toast.success(`${product.name} added! 🛍️`, { position: "bottom-center" });
  }, []);

  const removeItem     = useCallback((id: string) => {
    setCart((p) => p.filter((i) => i.id !== id));
    toast.error("Item removed");
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((p) => {
      const updated = p.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      );
      return updated.filter((i) => i.quantity > 0);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setPromoDiscount(0);
    setActivePromo(null);
  }, []);

  const applyPromo = useCallback((code: string): boolean => {
    const discount = PROMO_CODES[code.toUpperCase()];
    if (discount) {
      setPromoDiscount(discount);
      setActivePromo(code.toUpperCase());
      toast.success(`🎉 Promo applied! ${discount}% off`);
      return true;
    }
    toast.error("Invalid promo code ❌");
    return false;
  }, []);

  const cartItemCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const rawTotal      = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const cartSavings   = useMemo(() => cart.reduce((s, i) => {
    if (i.originalPrice) return s + (i.originalPrice - i.price) * i.quantity;
    return s;
  }, 0), [cart]);
  const cartTotal = useMemo(() => Math.round(rawTotal * (1 - promoDiscount / 100)), [rawTotal, promoDiscount]);

  const value = useMemo(() => ({
    cart, cartItemCount, cartTotal, cartSavings,
    isCartOpen, lastAdded,
    addToCart, removeItem, updateQuantity, clearCart,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    applyPromo, promoDiscount, activePromo,
  }), [cart, cartItemCount, cartTotal, cartSavings,
       isCartOpen, lastAdded, addToCart, removeItem,
       updateQuantity, clearCart, applyPromo, promoDiscount, activePromo]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useContext(AuthContext) ?? { user: null };
  const wishlistKey = user?.id ? `xob_wishlist_${user.id}` : "xob_wishlist_guest";

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(wishlistKey) || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(wishlistKey);
      setWishlist(saved ? JSON.parse(saved) : []);
    } catch { setWishlist([]); }
  }, [wishlistKey]);

  useEffect(() => {
    localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  }, [wishlist, wishlistKey]);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((p) => {
      const next = p.includes(id) ? p.filter((x) => x !== id) : [...p, id];
      if (!p.includes(id)) toast.success("Added to wishlist ❤️");
      else toast.error("Removed from wishlist");
      return next;
    });
  }, []);

  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const value = useMemo(() => ({
    wishlist, toggleWishlist, isWishlisted,
    wishlistCount: wishlist.length,
  }), [wishlist, toggleWishlist, isWishlisted]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

const RecentlyViewedProvider = ({ children }: { children: ReactNode }) => {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    try { return JSON.parse(localStorage.getItem("xob_recently") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("xob_recently", JSON.stringify(recentlyViewed.slice(0, 10)));
  }, [recentlyViewed]);

  const addToRecentlyViewed = useCallback((product: Product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 10);
    });
  }, []);

  const value = useMemo(() => ({ recentlyViewed, addToRecentlyViewed }),
    [recentlyViewed, addToRecentlyViewed]);

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback(
    (n: Omit<AppNotification, "id" | "createdAt" | "read">) => {
      const notification: AppNotification = {
        ...n,
        id: `notif_${Date.now()}`,
        createdAt: new Date(),
        read: false,
      };
      setNotifications((p) => [notification, ...p].slice(0, 20));
    }, []);

  const markAllRead = useCallback(() => {
    setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo(() => ({
    notifications, unreadCount,
    addNotification, markAllRead, clearAll,
  }), [notifications, unreadCount, addNotification, markAllRead, clearAll]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — ERROR BOUNDARY
// ══════════════════════════════════════════════════════════════════════════════

interface EBState { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <AlertCircle className="text-red-500" size={44} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic mb-3">
              Oops! Something Broke
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 font-medium bg-slate-50 dark:bg-slate-900 p-3 rounded-xl font-mono">
              {this.state.error?.message || "Unknown error"}
            </p>
            <p className="text-slate-400 text-xs mb-8">
              Don't worry, your cart is safe. Try refreshing.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm active:scale-95 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
              >
                <RefreshCw size={16} /> RELOAD
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/";
                }}
                className="flex items-center gap-2 px-6 py-3.5 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm active:scale-95 hover:border-slate-400 transition-all"
              >
                <Home size={16} /> HOME
              </button>
            </div>
          </motion.div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — ROUTE GUARDS
// ══════════════════════════════════════════════════════════════════════════════

const ProtectedRoute = ({ children }: { children?: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <GlobalLoader message="Verifying session..." />;
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return children ? <>{children}</> : <Outlet />;
};

const AdminRoute = ({ children }: { children?: ReactNode }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <GlobalLoader message="Checking permissions..." />;
  if (!isAuthenticated)
    return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children ? <>{children}</> : <Outlet />;
};

const GuestRoute = ({ children }: { children?: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <GlobalLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children ? <>{children}</> : <Outlet />;
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — LAYOUTS
// ══════════════════════════════════════════════════════════════════════════════

import Navbar      from "./components/Navbar";
import Layout      from "./components/Layout";
import ThemeToggle from "./components/ThemeToggle";

const MainLayout = () => {
  const { user, logout }            = useAuth();
  const { cartItemCount, openCart } = useCart();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <Layout cartItemCount={cartItemCount} onCartOpen={openCart}>
      <Navbar
        user={user}
        onLogout={() => setIsLogoutModalOpen(true)}
        cartItemCount={cartItemCount}
        onCartOpen={openCart}
        onShopClick={() => {}}
        onAboutClick={() => {}}
        themeElement={<ThemeToggle />}
      />
      <main><Outlet /></main>
      <CartSidebar />
      <AIAssistantBubble />
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        onConfirm={async () => { await logout(); setIsLogoutModalOpen(false); }}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </Layout>
  );
};

const AuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-slate-900">
    <Outlet />
  </div>
);

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/admin",           icon: BarChart3 },
    { label: "Orders",    href: "/admin/orders",    icon: Package },
    { label: "Products",  href: "/admin/products",  icon: Tag },
    { label: "Customers", href: "/admin/customers", icon: User },
    { label: "Settings",  href: "/admin/settings",  icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Crown size={18} className="text-white" />
            </div>
            <span className="font-black text-base italic uppercase text-white">
              X ONE ADMIN
            </span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm uppercase transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center">
              <span className="text-white font-black text-xs uppercase">
                {user?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">{user?.name}</p>
              <p className="text-[10px] text-slate-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 7 — UTILITY COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const GlobalLoader = ({ message }: { message?: string }) => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-950">
    <div className="relative mb-6">
      <div className="w-20 h-20 rounded-full border-4 border-slate-100 dark:border-slate-800" />
      <div className="w-20 h-20 rounded-full border-4 border-t-blue-600 absolute top-0 left-0 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles size={20} className="text-blue-600" />
      </div>
    </div>
    <p className="font-black text-slate-900 dark:text-white text-xl uppercase italic tracking-widest">
      X ONE BOUTIQUE
    </p>
    {message && (
      <p className="text-slate-400 text-xs mt-2 font-medium animate-pulse">{message}</p>
    )}
  </div>
);

const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-t-blue-600 border-slate-100 dark:border-slate-800 animate-spin" />
      <p className="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">
        Loading...
      </p>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 8 — AI ASSISTANT BUBBLE
// ══════════════════════════════════════════════════════════════════════════════

const AIAssistantBubble = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Hi! I'm your X One Style AI 👗 Ask me for outfit recommendations, size help, or style advice!" }
  ]);
  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const cartSummary = cart.map(i => `${i.name} x${i.quantity}`).join(", ");

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: `You are a friendly, knowledgeable fashion AI assistant for X One Boutique — a premium Indian fashion store. 
You help customers with: outfit recommendations, size guidance, styling tips, and product info.
Current cart: ${cartSummary || "empty"}.
User name: ${user?.name || "Guest"}.
Keep responses SHORT (2-3 sentences), friendly, and fashion-forward. Use 1-2 emojis max.
Always recommend products from categories: T-Shirts, Shirts, Trousers, Jackets, Accessories.`,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await response.json();
      const aiText = data.content?.[0]?.text || "Let me think about that! Try asking about specific styles or sizes.";
      setMessages((p) => [...p, { role: "ai", text: aiText }]);
    } catch {
      setMessages((p) => [...p, { role: "ai", text: "Oops! Connection issue. Try again in a moment! 🙏" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-[300] w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Style Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="open"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}
            >
              <Sparkles size={22} />
            </motion.div>
          )}
        </AnimatePresence>
        <span className="absolute w-full h-full rounded-full bg-blue-400 opacity-30 animate-ping" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-[300] w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-black/20 dark:shadow-black/60 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
            style={{ maxHeight: "420px" }}
          >
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="font-black text-sm">X One Style AI</p>
                  <p className="text-[10px] text-blue-200">Powered by Claude AI ✨</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-green-300 font-bold">Live</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "200px", maxHeight: "260px" }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "ai" && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <Sparkles size={10} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={10} className="text-white" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {["Outfit ideas", "Size help", "What's trending?"].map((s) => (
                <button key={s} onClick={() => setInput(s)}
                  className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  {s}
                </button>
              ))}
            </div>

            <div className="p-3 border-t dark:border-slate-800 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about styles..."
                className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder:text-slate-400"
              />
              <button onClick={sendMessage} disabled={isLoading || !input.trim()}
                className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all hover:bg-blue-700">
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 9 — CART SIDEBAR
// ══════════════════════════════════════════════════════════════════════════════

const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
};

const CartSidebar = () => {
  const {
    cart, cartTotal, cartSavings, isCartOpen, closeCart,
    updateQuantity, clearCart, applyPromo, promoDiscount, activePromo,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addNotification }       = useNotifications();
  const navigate                  = useNavigate();

  const [step, setStep] = useState<"cart" | "contact" | "address">("cart");
  const [promoInput, setPromoInput] = useState("");
  const [formData, setFormData] = useState({
    phone: "", email: user?.email || "",
    fullName: user?.name || "",
    pincode: "", city: "", address: "", landmark: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((p) => ({
        ...p,
        email:    user.email    || p.email,
        fullName: user.name     || p.fullName,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!isCartOpen) {
      const t = setTimeout(() => setStep("cart"), 350);
      return () => clearTimeout(t);
    }
  }, [isCartOpen]);

  const validateAddress = useCallback((): boolean => {
    const { pincode, city, fullName, address, landmark } = formData;
    if (!pincode || pincode.length !== 6) { toast.error("Valid 6-digit PIN required ❌"); return false; }
    if (!city)     { toast.error("City required"); return false; }
    if (!fullName) { toast.error("Full name required"); return false; }
    if (!address)  { toast.error("Address required"); return false; }
    if (!landmark) { toast.error("Landmark required"); return false; }
    return true;
  }, [formData]);

  const handleProceedToCheckout = useCallback(() => {
    if (!isAuthenticated) {
      toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-white dark:bg-slate-900 shadow-2xl rounded-2xl p-4 border-l-4 border-red-500 flex items-start gap-3`}>
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-black text-gray-900 dark:text-white uppercase">Login Required</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Please log in to checkout 🛍️</p>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-red-500">
            <X size={16} />
          </button>
        </div>
      ), { id: "auth-required", duration: 2500 });
      closeCart();
      navigate("/login");
      return;
    }
    setStep("contact");
  }, [isAuthenticated, closeCart, navigate]);

  const handleContinueToAddress = useCallback(() => {
    const { phone, email } = formData;
    if (!phone) return toast.error("Phone required");
    if (!/^[0-9]{10}$/.test(phone)) return toast.error("Valid 10-digit phone required ❌");
    if (!email) return toast.error("Email required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Invalid email");
    setStep("address");
  }, [formData]);

  const handleOnlinePayment = useCallback(async () => {
    if (!validateAddress()) return;
    const loaded = await loadRazorpay();
    if (!loaded) return toast.error("Razorpay failed to load ❌");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return toast.error("Session expired. Please login again!");

      const { data: orderData, error: dbError } = await supabase
        .from("orders")
        .insert([{
          user_id:      session.user.id,
          full_name:    formData.fullName,
          phone:        formData.phone,
          address:      `${formData.address}, ${formData.landmark}`,
          city:         formData.city,
          pincode:      formData.pincode,
          total_amount: cartTotal,
          items:        cart,
          status:       "awaiting_payment",
        }])
        .select();

      if (dbError) throw dbError;
      const orderId = orderData[0].id;

      const options = {
        key:         "rzp_live_SJYY3uYtuUcaHe",
        amount:       cartTotal * 100,
        currency:     "INR",
        name:         "X ONE BOUTIQUE",
        description:  `Order (${cart.length} items)`,
        prefill: {
          name:    formData.fullName,
          email:   formData.email,
          contact: formData.phone,
        },
        notes: { address: `${formData.address}, ${formData.city} - ${formData.pincode}` },
        theme: { color: "#2563eb" },
        handler: async (response: any) => {
          await supabase.from("orders").update({
            status:            "paid",
            razorpay_order_id: response.razorpay_payment_id,
          }).eq("id", orderId);

          new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3")
            .play().catch(() => {});

          addNotification({
            type:    "order",
            title:   "Order Confirmed! 🎉",
            message: `Payment of ₹${cartTotal} successful. ID: ${response.razorpay_payment_id.substring(0, 12)}`,
            icon:    "🛍️",
          });

          toast.custom((t) => (
            <div className={`${t.visible ? "animate-in fade-in zoom-in" : "animate-out"} max-w-sm w-full bg-[#0a0a0a] border-2 border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.4)] rounded-2xl flex overflow-hidden`}>
              <div className="flex-1 p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-[10px]">X1</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic mb-1">X-One Boutique</p>
                    <p className="text-sm font-bold text-white">Order Placed! 🛍️</p>
                    <p className="mt-1 text-[10px] text-slate-400 italic">Your style is on its way!</p>
                    <p className="mt-2 text-[8px] font-mono text-amber-500/60 uppercase">
                      ID: {response.razorpay_payment_id.substring(0, 14)}
                    </p>
                  </div>
                </div>
              </div>
              <button onClick={() => toast.dismiss(t.id)} className="px-4 text-[10px] font-black text-amber-500 uppercase hover:bg-amber-500/5 transition-all">
                CLOSE
              </button>
            </div>
          ), { duration: 6000, position: "top-center" });

          clearCart();
          closeCart();
          navigate("/orders");
        },
      };
      new (window as any).Razorpay(options).open();
    } catch (err: any) {
      toast.error("Order failed: " + err.message);
    }
  }, [validateAddress, cart, cartTotal, formData, clearCart, closeCart, navigate, addNotification]);

  const handleWhatsAppOrder = useCallback(async () => {
    if (!validateAddress()) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.from("orders").insert([{
        user_id:      session?.user.id,
        full_name:    formData.fullName,
        phone:        formData.phone,
        address:      `${formData.address}, ${formData.landmark}`,
        city:         formData.city,
        pincode:      formData.pincode,
        total_amount: cartTotal,
        items:        cart,
        status:       "COD",
      }]);

      const items = cart.map((i) =>
        `• ${i.name} (x${i.quantity}) - ₹${i.price * i.quantity}`
      ).join("%0A");
      const msg = `*NEW COD ORDER - X ONE BOUTIQUE*%0A%0A*Customer:* ${formData.fullName}%0A*Phone:* ${formData.phone}%0A*Address:* ${formData.address}, ${formData.landmark}, ${formData.city} - ${formData.pincode}%0A%0A*Items:*%0A${items}%0A%0A*Total: ₹${cartTotal}*`;
      window.open(`https://wa.me/917208428589?text=${msg}`, "_blank");

      addNotification({
        type:    "order",
        title:   "COD Order Placed! 📦",
        message: `Order of ₹${cartTotal} placed via WhatsApp`,
        icon:    "📱",
      });

      clearCart();
      closeCart();
      navigate("/orders");
    } catch {
      toast.error("Sync failed, WhatsApp opening...");
    }
  }, [validateAddress, cart, cartTotal, formData, clearCart, closeCart, navigate, addNotification]);

  const setField = useCallback(
    (field: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setFormData((p) => ({ ...p, [field]: e.target.value })),
    []
  );

  const handleApplyPromo = () => {
    applyPromo(promoInput);
    setPromoInput("");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeCart}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col"
          >
            <div className="p-5 border-b dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <button
                onClick={() =>
                  step === "address" ? setStep("contact") :
                  step === "contact" ? setStep("cart") : closeCart()
                }
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                aria-label="Go back"
              >
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                  {step === "cart" ? "Your Cart" : step === "contact" ? "Contact Info" : "Delivery Address"}
                </span>
                <div className="flex gap-1.5 mt-1.5">
                  {(["cart", "contact", "address"] as const).map((s) => (
                    <div key={s} className={`h-1 rounded-full transition-all duration-300 ${step === s ? "w-6 bg-blue-600" : "w-3 bg-slate-200 dark:bg-slate-700"}`} />
                  ))}
                </div>
              </div>
              <button onClick={closeCart} aria-label="Close cart"
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === "cart" && (
                  <motion.div key="cart"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="p-5 space-y-3"
                  >
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-5">
                          <ShoppingBag size={36} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="font-black text-slate-400 uppercase text-sm">Cart is empty</p>
                        <p className="text-slate-300 dark:text-slate-600 text-xs mt-1">Add items to get started</p>
                        <button onClick={closeCart}
                          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all active:scale-95">
                          SHOP NOW
                        </button>
                      </div>
                    ) : (
                      <>
                        {cartSavings > 0 && (
                          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                            <Tag size={14} className="text-green-600" />
                            <span className="text-xs font-black text-green-600">
                              You're saving ₹{cartSavings} on this order!
                            </span>
                          </div>
                        )}

                        {cart.map((item) => (
                          <div key={item.id}
                            className="flex gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl group">
                            <div className="relative">
                              <img src={item.images?.[0] || (item as any).image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                              {item.selectedSize && (
                                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">
                                  {item.selectedSize}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm dark:text-white truncate">{item.name}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <p className="text-blue-600 font-black text-sm">₹{item.price}</p>
                                {item.originalPrice && (
                                  <p className="text-slate-400 text-xs line-through">₹{item.originalPrice}</p>
                                )}
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-xl px-2.5 py-1 shadow-sm">
                                  <button onClick={() => updateQuantity(item.id, -1)}
                                    className="text-slate-500 hover:text-blue-600 transition-colors">
                                    <Minus size={12} />
                                  </button>
                                  <span className="font-black text-sm w-4 text-center dark:text-white">
                                    {item.quantity}
                                  </span>
                                  <button onClick={() => updateQuantity(item.id, 1)}
                                    className="text-slate-500 hover:text-blue-600 transition-colors">
                                    <Plus size={12} />
                                  </button>
                                </div>
                                <span className="font-black text-sm dark:text-white">
                                  ₹{item.price * item.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="mt-4">
                          {activePromo ? (
                            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                              <div className="flex items-center gap-2">
                                <Tag size={14} className="text-green-600" />
                                <span className="text-xs font-black text-green-700 dark:text-green-400">
                                  {activePromo} — {promoDiscount}% OFF applied!
                                </span>
                              </div>
                              <CheckCircle size={16} className="text-green-500" />
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <input
                                placeholder="Promo code"
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                                className="flex-1 px-3 py-2.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-white uppercase placeholder:normal-case placeholder:text-slate-400"
                              />
                              <button onClick={handleApplyPromo}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all active:scale-95">
                                APPLY
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {step === "contact" && (
                  <motion.div key="contact"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="p-5 space-y-4"
                  >
                    <div className="text-center py-2">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <User className="text-blue-600" size={22} />
                      </div>
                      <h3 className="font-black text-sm uppercase dark:text-white">Contact Information</h3>
                      <p className="text-slate-400 text-xs mt-0.5">We'll use this for delivery updates</p>
                    </div>
                    <div className="space-y-3">
                      <input type="tel" placeholder="Mobile Number (10 digits)" maxLength={10}
                        className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-medium"
                        value={formData.phone}
                        onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                      />
                      <input type="email" placeholder="Email Address"
                        className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-medium"
                        value={formData.email}
                        onChange={setField("email")}
                      />
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-xl flex items-start gap-2">
                      <ShieldCheck size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                        Your info is encrypted and never shared with third parties.
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === "address" && (
                  <motion.div key="address"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    className="p-5 space-y-3"
                  >
                    <div className="text-center py-2">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <MapPin className="text-blue-600" size={22} />
                      </div>
                      <h3 className="font-black text-sm uppercase dark:text-white">Delivery Address</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="PIN Code" maxLength={6}
                        className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-medium"
                        value={formData.pincode}
                        onChange={(e) => setFormData((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, "") }))}
                      />
                      <input placeholder="City" maxLength={19}
                        className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-medium"
                        value={formData.city}
                        onChange={setField("city")}
                      />
                    </div>
                    <input placeholder="Full Name"
                      className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-medium"
                      value={formData.fullName}
                      onChange={setField("fullName")}
                    />
                    <textarea placeholder="House No, Street, Area"
                      className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none h-20 focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-medium resize-none"
                      value={formData.address}
                      onChange={setField("address")}
                    />
                    <input placeholder="Nearby Landmark"
                      className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white text-sm font-medium"
                      value={formData.landmark}
                      onChange={setField("landmark")}
                    />
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                      <Truck size={16} className="text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-300">Free Delivery</p>
                        <p className="text-[10px] text-slate-400">Estimated 3-5 business days</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-5 border-t dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="font-medium">Subtotal ({cart.reduce((s,i)=>s+i.quantity,0)} items)</span>
                  <span className="font-bold dark:text-slate-300">₹{cart.reduce((s,i)=>s+i.price*i.quantity,0)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-xs text-green-600">
                    <span className="font-bold">Promo ({promoDiscount}% off)</span>
                    <span className="font-black">-₹{cart.reduce((s,i)=>s+i.price*i.quantity,0) - cartTotal}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="font-medium">Delivery</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t dark:border-slate-800">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Total Payable</span>
                  <span className="text-2xl font-black dark:text-white">₹{cartTotal}</span>
                </div>
              </div>

              {step === "cart" && (
                <div className="flex flex-col gap-2.5">
                  <button onClick={handleProceedToCheckout} disabled={cart.length === 0}
                    className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black disabled:opacity-40 active:scale-95 transition-all hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center gap-2">
                    PROCEED TO CHECKOUT <ArrowRight size={16} />
                  </button>
                  <button onClick={clearCart} disabled={cart.length === 0}
                    className="w-full py-3 border-2 border-slate-100 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-20 text-sm">
                    <Trash2 size={15} /> CLEAR CART
                  </button>
                </div>
              )}

              {step === "contact" && (
                <button onClick={handleContinueToAddress}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black active:scale-95 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  CONTINUE <ArrowRight size={16} />
                </button>
              )}

              {step === "address" && (
                <div className="space-y-2.5">
                  <button onClick={handleOnlinePayment}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20">
                    <CreditCard size={16} /> PAY ONLINE (UPI / Card)
                  </button>
                  <button onClick={handleWhatsAppOrder}
                    className="w-full py-4 border-2 border-green-500 text-green-600 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-green-50 dark:hover:bg-green-900/10 active:scale-95 transition-all">
                    <MessageCircle size={16} /> WHATSAPP ORDER (COD)
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 10 — LOGOUT MODAL
// ══════════════════════════════════════════════════════════════════════════════

const LogoutConfirmationModal = ({
  isOpen, onConfirm, onCancel,
}: { isOpen: boolean; onConfirm: () => void; onCancel: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl p-8 border border-slate-100 dark:border-slate-800"
          role="dialog" aria-modal="true"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex-shrink-0">
              <AlertCircle className="text-amber-500" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">
                Log Out?
              </h3>
              <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                Your cart will be saved. You can log back in anytime.
              </p>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button onClick={onConfirm}
              className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl active:scale-95 uppercase text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
              Confirm
            </button>
            <button onClick={onCancel}
              className="flex-1 py-4 border-2 border-slate-100 dark:border-slate-800 text-slate-400 font-black rounded-2xl active:scale-95 uppercase text-xs hover:border-slate-300 transition-all">
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 11 — ANIMATED ROUTES  ✅ FIXED
// ══════════════════════════════════════════════════════════════════════════════

const AnimatedRoutes = () => {
  const location    = useLocation();
  const { addToCart } = useCart();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── Main Layout ── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><HomePage /></PageTransition>
            </Suspense>
          } />
          <Route path="/shop" element={
            <PageTransition><ShopPage /></PageTransition>
          } />
          <Route path="/wishlist" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><WishlistPage /></PageTransition>
            </Suspense>
          } />
          <Route path="/product/:id" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><ProductPage onAddToCart={addToCart} /></PageTransition>
            </Suspense>
          } />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={
              <Suspense fallback={<PageLoader />}>
                <PageTransition><CartPage /></PageTransition>
              </Suspense>
            } />
            <Route path="/checkout" element={
              <Suspense fallback={<PageLoader />}>
                <PageTransition><CheckoutPage /></PageTransition>
              </Suspense>
            } />
            <Route path="/orders" element={
              <Suspense fallback={<PageLoader />}>
                <PageTransition><OrdersPage /></PageTransition>
              </Suspense>
            } />
            <Route path="/profile" element={
              <Suspense fallback={<PageLoader />}>
                <PageTransition><ProfilePage /></PageTransition>
              </Suspense>
            } />
            <Route path="/settings" element={
              <Suspense fallback={<PageLoader />}>
                <PageTransition><SettingsPage /></PageTransition>
              </Suspense>
            } />
          </Route>

          {/* Info / Policy Pages */}
          <Route path="/about"    element={<PageTransition><AboutPage    /></PageTransition>} />
          <Route path="/contact"  element={<PageTransition><ContactPage  /></PageTransition>} />
          <Route path="/faq"      element={<PageTransition><FAQPage      /></PageTransition>} />
          <Route path="/privacy"  element={<PageTransition><PrivacyPage  /></PageTransition>} />
          <Route path="/refund"   element={<PageTransition><RefundPage   /></PageTransition>} />
          <Route path="/shipping" element={<PageTransition><ShippingPage /></PageTransition>} />
          <Route path="/terms"    element={<PageTransition><TermsPage    /></PageTransition>} />
        </Route>

        {/* ── Auth Layout ── */}
        <Route element={<AuthLayout />}>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={
              <Suspense fallback={<PageLoader />}>
                <PageTransition><LoginPage /></PageTransition>
              </Suspense>
            } />
            <Route path="/register" element={
              <Suspense fallback={<PageLoader />}>
                <PageTransition><RegisterPage /></PageTransition>
              </Suspense>
            } />
            <Route path="/forgot-password" element={
              <Suspense fallback={<PageLoader />}>
                <PageTransition><ForgotPassword /></PageTransition>
              </Suspense>
            } />
          </Route>
          <Route path="/update-password" element={
            <Suspense fallback={<PageLoader />}>
              <PageTransition><UpdatePassword /></PageTransition>
            </Suspense>
          } />
        </Route>

        {/* ── Admin Layout ── */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={
              <Suspense fallback={<PageLoader />}>
                <PageTransition><AdminDashboard /></PageTransition>
              </Suspense>
            } />
          </Route>
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={
          <Suspense fallback={<PageLoader />}>
            <PageTransition><NotFoundPage /></PageTransition>
          </Suspense>
        } />

      </Routes>
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 12 — ROOT APP
// ══════════════════════════════════════════════════════════════════════════════

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                <NotificationProvider>
                  <Router>
                    <ScrollToTop />
                    <Toaster
                      position="bottom-center"
                      gutter={8}
                      toastOptions={{
                        duration: 3000,
                        style: { marginBottom: "90px", zIndex: 9999 },
                      }}
                    />
                    <AnimatedRoutes />
                  </Router>
                </NotificationProvider>
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;