import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../App";
import { Package, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  items: any[];
  city: string;
  pincode: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  paid:              { label: "Paid",            color: "text-green-600 bg-green-50 dark:bg-green-900/20",   icon: CheckCircle },
  COD:               { label: "Cash on Delivery", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",  icon: Clock },
  awaiting_payment:  { label: "Pending",          color: "text-slate-500 bg-slate-100 dark:bg-slate-800",    icon: Clock },
  cancelled:         { label: "Cancelled",        color: "text-red-500 bg-red-50 dark:bg-red-900/20",        icon: XCircle },
};

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) setOrders(data);
      setIsLoading(false);
    };

    fetchOrders();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <Package size={64} className="text-slate-200 dark:text-slate-700 mb-6" />
        <h2 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white mb-2">
          No Orders Yet
        </h2>
        <p className="text-slate-400 font-medium">
          Your order history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black uppercase italic dark:text-white mb-8">
        My Orders
      </h1>
      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig["awaiting_payment"];
          const StatusIcon = status.icon;

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-400 font-mono mb-1">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase ${status.color}`}
                >
                  <StatusIcon size={12} />
                  {status.label}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items?.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-bold dark:text-white">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <p className="text-xs text-slate-400">
                    +{order.items.length - 3} more items
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t dark:border-slate-800">
                <span className="text-sm text-slate-400">
                  📍 {order.city} - {order.pincode}
                </span>
                <span className="text-xl font-black dark:text-white">
                  ₹{order.total_amount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
