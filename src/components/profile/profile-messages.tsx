"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Search,
  Send,
  Plus,
  Archive,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useProfileMessages } from "@/hooks/use-profile";
import { useUser } from "@/presentation/hooks/use-user";

type FilterType = "all" | "unread" | "read" | "starred" | "archived";
type MessageStatus = "sent" | "delivered" | "read";

export function ProfileMessages() {
  const { user } = useUser();
  const {
    messages,
    loading,
    sendMessage,
    markAsRead,
    toggleStar,
    archiveMessage,
  } = useProfileMessages();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [newMessage, setNewMessage] = useState({
    to: "",
    subject: "",
    content: "",
  });
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  // Filtro messaggi
  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      switch (filterType) {
        case "unread":
          return !message.read;
        case "read":
          return message.read;
        case "starred":
          return message.starred;
        case "archived":
          return message.archived;
        default:
          return !message.archived; // Non mostrare messaggi archiviati per default
      }
    })();

    return matchesSearch && matchesFilter;
  });

  const handleSendMessage = async () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.content) {
      toast.error("Compila tutti i campi richiesti");
      return;
    }

    try {
      await sendMessage({
        to: newMessage.to,
        subject: newMessage.subject,
        content: newMessage.content,
      });

      toast.success("Messaggio inviato con successo");
      setNewMessage({ to: "", subject: "", content: "" });
      setIsComposing(false);
    } catch (error) {
      toast.error("Errore durante l'invio del messaggio");
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    setProcessingIds((prev) => [...prev, messageId]);

    try {
      await markAsRead(messageId);
      toast.success("Messaggio segnato come letto");
    } catch (error) {
      toast.error("Errore durante l'aggiornamento del messaggio");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== messageId));
    }
  };

  const handleToggleStar = async (messageId: string) => {
    setProcessingIds((prev) => [...prev, messageId]);

    try {
      await toggleStar(messageId);
      const message = messages.find((m) => m.id === messageId);
      toast.success(
        message?.starred ? "Stella rimossa" : "Messaggio aggiunto ai preferiti"
      );
    } catch (error) {
      toast.error("Errore durante l'aggiornamento del messaggio");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== messageId));
    }
  };

  const handleArchive = async (messageId: string) => {
    setProcessingIds((prev) => [...prev, messageId]);

    try {
      await archiveMessage(messageId);
      toast.success("Messaggio archiviato");
      if (selectedMessage === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast.error("Errore durante l'archiviazione del messaggio");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== messageId));
    }
  };

  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case "sent":
        return "📤";
      case "delivered":
        return "📬";
      case "read":
        return "📖";
      default:
        return "📝";
    }
  };

  const getMessageStatusColor = (status: MessageStatus) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "delivered":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "read":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const selectedMessageData = selectedMessage
    ? messages.find((m) => m.id === selectedMessage)
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Caricamento messaggi...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con statistiche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Messaggi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {messages.length}
              </div>
              <div className="text-sm text-muted-foreground">Totali</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {messages.filter((m) => !m.read && !m.archived).length}
              </div>
              <div className="text-sm text-muted-foreground">Non letti</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {messages.filter((m) => m.starred && !m.archived).length}
              </div>
              <div className="text-sm text-muted-foreground">Preferiti</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {messages.filter((m) => m.archived).length}
              </div>
              <div className="text-sm text-muted-foreground">Archiviati</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controlli */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cerca messaggi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={filterType}
              onValueChange={(value: FilterType) => setFilterType(value)}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtra per stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i messaggi</SelectItem>
                <SelectItem value="unread">Non letti</SelectItem>
                <SelectItem value="read">Letti</SelectItem>
                <SelectItem value="starred">Preferiti</SelectItem>
                <SelectItem value="archived">Archiviati</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isComposing} onOpenChange={setIsComposing}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Messaggio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuovo Messaggio</DialogTitle>
                  <DialogDescription>
                    Componi un nuovo messaggio
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="to">Destinatario</Label>
                    <Input
                      id="to"
                      placeholder="Email del destinatario"
                      value={newMessage.to}
                      onChange={(e) =>
                        setNewMessage((prev) => ({
                          ...prev,
                          to: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Oggetto</Label>
                    <Input
                      id="subject"
                      placeholder="Oggetto del messaggio"
                      value={newMessage.subject}
                      onChange={(e) =>
                        setNewMessage((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Messaggio</Label>
                    <Textarea
                      id="content"
                      placeholder="Scrivi il tuo messaggio..."
                      rows={4}
                      value={newMessage.content}
                      onChange={(e) =>
                        setNewMessage((prev) => ({
                          ...prev,
                          content: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsComposing(false)}
                  >
                    Annulla
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4 mr-2" />
                    Invia
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Layout messaggi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista messaggi */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Messaggi ({filteredMessages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {filteredMessages.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    Nessun messaggio trovato
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                          selectedMessage === message.id
                            ? "bg-muted border-l-primary"
                            : message.read
                            ? "border-l-transparent"
                            : "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        }`}
                        onClick={() => {
                          setSelectedMessage(message.id);
                          if (!message.read) {
                            handleMarkAsRead(message.id);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.sender.avatar} />
                              <AvatarFallback>
                                {message.sender.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">
                                  {message.sender.name}
                                </p>
                                {message.starred && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                )}
                              </div>
                              <p className="text-sm font-medium truncate">
                                {message.subject}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {message.content}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getMessageStatusColor(
                                message.status
                              )}`}
                            >
                              {getMessageStatusIcon(message.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(message.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Dettaglio messaggio */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedMessageData
                  ? "Dettaglio Messaggio"
                  : "Seleziona un messaggio"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMessageData ? (
                <div className="space-y-4">
                  {/* Header messaggio */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedMessageData.sender.avatar} />
                        <AvatarFallback>
                          {selectedMessageData.sender.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {selectedMessageData.sender.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedMessageData.sender.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStar(selectedMessageData.id)}
                        disabled={processingIds.includes(
                          selectedMessageData.id
                        )}
                      >
                        {processingIds.includes(selectedMessageData.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Star
                            className={`h-4 w-4 ${
                              selectedMessageData.starred
                                ? "text-yellow-500 fill-current"
                                : ""
                            }`}
                          />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(selectedMessageData.id)}
                        disabled={processingIds.includes(
                          selectedMessageData.id
                        )}
                      >
                        {processingIds.includes(selectedMessageData.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Oggetto e metadati */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      {selectedMessageData.subject}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        📅 {formatDate(selectedMessageData.createdAt)}
                      </span>
                      <Badge
                        variant="secondary"
                        className={getMessageStatusColor(
                          selectedMessageData.status
                        )}
                      >
                        {getMessageStatusIcon(selectedMessageData.status)}{" "}
                        {selectedMessageData.status}
                      </Badge>
                      {selectedMessageData.starred && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          ⭐ Preferito
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Contenuto messaggio */}
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap">
                      {selectedMessageData.content}
                    </div>
                  </div>

                  {/* Allegati (se presenti) */}
                  {selectedMessageData.attachments &&
                    selectedMessageData.attachments.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">
                            Allegati ({selectedMessageData.attachments.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedMessageData.attachments.map(
                              (attachment, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-2 p-2 border rounded"
                                >
                                  <span>📎</span>
                                  <span className="text-sm">
                                    {attachment.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({attachment.size})
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    Seleziona un messaggio dalla lista per visualizzarne i
                    dettagli
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
