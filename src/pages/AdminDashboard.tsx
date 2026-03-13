import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Order {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  city: string;
  total_amount: number;
  status: string;
  items: any[];
}

const statusOptions = ["awaiting_payment", "paid", "COD", "shipped", "delivered", "cancelled"];

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    paidOrders: 0,
    codOrders: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
      setStats({
        totalOrders: data.length,
        totalRevenue: data.filter(o => o.status === "paid").reduce((sum, o) => sum + o.total_amount, 0),
        paidOrders: data.filter(o => o.status === "paid").length,
        codOrders: data.filter(o => o.status === "COD").length,
      });
    }
    setIsLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated! ✅");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders, icon: Package, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
    { label: "Revenue (Paid)", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
    { label: "Paid Online", value: stats.paidOrders, icon: CheckCircle, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "COD Orders", value: stats.codOrders, icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black uppercase italic dark:text-white mb-8">
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-black dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-400 font-bold uppercase mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b dark:border-slate-800">
          <h2 className="font-black uppercase text-sm text-slate-600 dark:text-slate-300">
            All Orders ({orders.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs font-black uppercase text-slate-400 border-b dark:border-slate-800">
                <th className="text-left p-4">Order ID</th>
                <th className="text-left p-4">Customer</th>
                <th className="text-left p-4">City</th>
                <th className="text-left p-4">Items</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-4">
                    <span className="font-mono text-xs text-slate-400">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-sm dark:text-white">{order.full_name}</p>
                    <p className="text-xs text-slate-400">{order.phone}</p>
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{order.city}</td>
                  <td className="p-4 text-sm font-bold dark:text-white">{order.items?.length || 0}</td>
                  <td className="p-4">
                    <span className="font-black text-blue-600">₹{order.total_amount}</span>
                  </td>
                  <td className="p-4 text-xs text-slate-400">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-xs font-black px-3 py-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white outline-none focus:border-blue-600 cursor-pointer"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
