import { Bell, Package, Truck, CheckCircle, X, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// LoadingScreen component is now part of this file
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <img src="/public/vite.svg" alt="App Logo" className="w-24 h-24 mb-4 animate-bounce" />
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    </div>
  );
}

interface Notification {
  id: string;
  type: "order" | "delivery" | "promo" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const notificationIcons = {
  order: Package,
  delivery: Truck,
  promo: Bell,
  system: CheckCircle,
};

const notificationColors = {
  order: "text-blue-600 bg-blue-50",
  delivery: "text-orange-600 bg-orange-50",
  promo: "text-green-600 bg-green-50",
  system: "text-gray-600 bg-gray-50",
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("time", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
      } else {
        setNotifications(data as Notification[]);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", unreadIds);

    if (error) {
      console.error("Error updating notifications:", error);
    } else {
      setNotifications(
        notifications.map((n) => ({ ...n, read: true }))
      );
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500">
                    {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-3">
            {notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              const colorClass = notificationColors[notification.type];

              return (
                <Card
                  key={notification.id}
                  className={`p-4 transition-colors ${
                    !notification.read ? "bg-orange-50/50 border-orange-200" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                        {!notification.read && (
                          <Badge className="bg-orange-600 text-white text-xs px-2 py-0">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-400">{new Date(notification.time).toLocaleString()}</p>
                    </div>

                    <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
