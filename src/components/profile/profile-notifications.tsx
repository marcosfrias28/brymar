"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  Trash2,
  Check,
  CheckCheck,
  Filter,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProfileNotifications } from "@/hooks/use-profile";
// Profile actions need to be implemented in DDD structure
// import {
//   markNotificationAsReadAction,
//   markAllNotificationsAsReadAction,
// } from "@/presentation/server-actions/profile-actions";
import { useUser } from "@/hooks/use-user";

type FilterType = "all" | "unread" | "read";
type NotificationType = "all" | "success" | "error" | "info" | "warning";

export function ProfileNotifications() {
  const { user } = useUser();
  const { notifications, loading, markAsRead, markAllAsRead } =
    useProfileNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [notificationType, setNotificationType] =
    useState<NotificationType>("all");
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesReadStatus =
      filterType === "all" ||
      (filterType === "read" && notification.read) ||
      (filterType === "unread" && !notification.read);

    const matchesType =
      notificationType === "all" || notification.type === notificationType;

    return matchesSearch && matchesReadStatus && matchesType;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    setProcessingIds((prev) => [...prev, notificationId]);

    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("notificationId", notificationId);
      // Mark notification as read functionality needs to be implemented in DDD structure
      toast.error(
        "Mark notification as read functionality needs to be implemented in DDD structure"
      );
      return;
    } catch (error) {
      toast.error("Errore durante l'aggiornamento della notifica");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== notificationId));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    setIsMarkingAllRead(true);

    try {
      const formData = new FormData();
      formData.append("userId", user.id);
      // Mark all notifications as read functionality needs to be implemented in DDD structure
      toast.error(
        "Mark all notifications as read functionality needs to be implemented in DDD structure"
      );
      return;
    } catch (error) {
      toast.error("Errore durante l'aggiornamento delle notifiche");
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    setProcessingIds((prev) => [...prev, notificationId]);

    try {
      // Simulazione eliminazione notifica
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Notifica eliminata con successo");
    } catch (error) {
      toast.error("Errore durante l'eliminazione della notifica");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== notificationId));
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);

    try {
      // Simulazione eliminazione tutte le notifiche
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Tutte le notifiche sono state eliminate");
    } catch (error) {
      toast.error("Errore durante l'eliminazione delle notifiche");
    } finally {
      setIsDeletingAll(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      case "warning":
        return "⚠️";
      default:
        return "📝";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case "success":
        return "Successo";
      case "error":
        return "Errore";
      case "info":
        return "Informazione";
      case "warning":
        return "Avviso";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse space-y-4 w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con azioni e filtri */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifiche</CardTitle>
              <Badge variant="secondary">{notifications.length}</Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} non lette</Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllRead}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Segna tutte come lette
                </Button>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={notifications.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina tutte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Elimina tutte le notifiche
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Sei sicuro di voler eliminare tutte le notifiche? Questa
                      azione non può essere annullata.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Elimina tutte
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <CardDescription>
            Gestisci le tue notifiche e preferenze
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca nelle notifiche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={filterType}
              onValueChange={(value: FilterType) => setFilterType(value)}
            >
              <SelectTrigger className="w-full lg:w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="unread">Non lette</SelectItem>
                <SelectItem value="read">Lette</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={notificationType}
              onValueChange={(value: NotificationType) =>
                setNotificationType(value)
              }
            >
              <SelectTrigger className="w-full lg:w-[150px]">
                <Bell className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                <SelectItem value="success">Successo</SelectItem>
                <SelectItem value="error">Errore</SelectItem>
                <SelectItem value="info">Informazione</SelectItem>
                <SelectItem value="warning">Avviso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista delle notifiche */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || filterType !== "all" || notificationType !== "all"
                ? "Nessuna notifica trovata"
                : "Nessuna notifica"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchTerm || filterType !== "all" || notificationType !== "all"
                ? "Prova a modificare i filtri per trovare le notifiche che stai cercando."
                : "Le tue notifiche appariranno qui quando ne riceverai."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                !notification.read
                  ? "border-l-4 border-l-primary bg-muted/30"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3
                          className={`font-semibold ${
                            !notification.read
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <Badge
                          className={getNotificationColor(notification.type)}
                        >
                          {getNotificationLabel(notification.type)}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="destructive" className="text-xs">
                            Nuovo
                          </Badge>
                        )}
                      </div>

                      <p
                        className={`text-sm mb-2 ${
                          !notification.read
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {notification.message}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={processingIds.includes(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={processingIds.includes(notification.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Elimina notifica</AlertDialogTitle>
                          <AlertDialogDescription>
                            Sei sicuro di voler eliminare questa notifica?
                            Questa azione non può essere annullata.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Elimina
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>

              {index < filteredNotifications.length - 1 && <Separator />}
            </Card>
          ))}
        </div>
      )}

      {/* Statistiche */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiche Notifiche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {notifications.length}
                </div>
                <div className="text-sm text-muted-foreground">Totale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {unreadCount}
                </div>
                <div className="text-sm text-muted-foreground">Non lette</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {notifications.filter((n) => n.type === "success").length}
                </div>
                <div className="text-sm text-muted-foreground">Successo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {notifications.filter((n) => n.type === "error").length}
                </div>
                <div className="text-sm text-muted-foreground">Errore</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {notifications.filter((n) => n.type === "info").length}
                </div>
                <div className="text-sm text-muted-foreground">Info</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
