"use client";

import { Archive, Loader2, Plus, Search, Send, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useProfileMessages } from "@/hooks/use-profile";
import { useUser } from "@/hooks/use-user";

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
		if (!(newMessage.to && newMessage.subject && newMessage.content)) {
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
		} catch (_error) {
			toast.error("Errore durante l'invio del messaggio");
		}
	};

	const handleMarkAsRead = async (messageId: string) => {
		setProcessingIds((prev) => [...prev, messageId]);

		try {
			await markAsRead(messageId);
			toast.success("Messaggio segnato come letto");
		} catch (_error) {
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
		} catch (_error) {
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
		} catch (_error) {
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

	const formatDate = (date: Date) =>
		new Intl.DateTimeFormat("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);

	const getMessageStatusLabel = (status: MessageStatus) => {
		switch (status) {
			case "sent":
				return "enviado";
			case "delivered":
				return "entregado";
			case "read":
				return "leído";
			default:
				return status;
		}
	};

	const selectedMessageData = selectedMessage
		? messages.find((m) => m.id === selectedMessage)
		: null;

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
				<span className="ml-2">Cargando mensajes...</span>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Encabezado con estadísticas */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Send className="h-5 w-5" />
						Mensajes
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
						<div className="text-center">
							<div className="font-bold text-2xl text-blue-600">
								{messages.length}
							</div>
							<div className="text-muted-foreground text-sm">Totales</div>
						</div>
						<div className="text-center">
							<div className="font-bold text-2xl text-orange-600">
								{messages.filter((m) => !(m.read || m.archived)).length}
							</div>
							<div className="text-muted-foreground text-sm">No leídos</div>
						</div>
						<div className="text-center">
							<div className="font-bold text-2xl text-yellow-600">
								{messages.filter((m) => m.starred && !m.archived).length}
							</div>
							<div className="text-muted-foreground text-sm">Favoritos</div>
						</div>
						<div className="text-center">
							<div className="font-bold text-2xl text-gray-600">
								{messages.filter((m) => m.archived).length}
							</div>
							<div className="text-muted-foreground text-sm">Archivados</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Controles */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col gap-4 xl:flex-row">
						<div className="flex-1">
							<div className="relative">
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
								<Input
									className="pl-10"
									onChange={(e) => setSearchTerm(e.target.value)}
									placeholder="Buscar mensajes..."
									value={searchTerm}
								/>
							</div>
						</div>
						<Select
							onValueChange={(value: FilterType) => setFilterType(value)}
							value={filterType}
						>
							<SelectTrigger className="w-full xl:w-48">
								<SelectValue placeholder="Filtrar por estado" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos los mensajes</SelectItem>
								<SelectItem value="unread">No leídos</SelectItem>
								<SelectItem value="read">Leídos</SelectItem>
								<SelectItem value="starred">Favoritos</SelectItem>
								<SelectItem value="archived">Archivados</SelectItem>
							</SelectContent>
						</Select>
						<Dialog onOpenChange={setIsComposing} open={isComposing}>
							<DialogTrigger asChild>
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Nuevo Mensaje
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Nuevo Mensaje</DialogTitle>
									<DialogDescription>
										Redacta un nuevo mensaje
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									<div>
										<Label htmlFor="to">Destinatario</Label>
										<Input
											id="to"
											onChange={(e) =>
												setNewMessage((prev) => ({
													...prev,
													to: e.target.value,
												}))
											}
											placeholder="Correo del destinatario"
											value={newMessage.to}
										/>
									</div>
									<div>
										<Label htmlFor="subject">Asunto</Label>
										<Input
											id="subject"
											onChange={(e) =>
												setNewMessage((prev) => ({
													...prev,
													subject: e.target.value,
												}))
											}
											placeholder="Asunto del mensaje"
											value={newMessage.subject}
										/>
									</div>
									<div>
										<Label htmlFor="content">Mensaje</Label>
										<Textarea
											id="content"
											onChange={(e) =>
												setNewMessage((prev) => ({
													...prev,
													content: e.target.value,
												}))
											}
											placeholder="Escribe tu mensaje..."
											rows={4}
											value={newMessage.content}
										/>
									</div>
								</div>
								<DialogFooter>
									<Button
										onClick={() => setIsComposing(false)}
										variant="outline"
									>
										Cancelar
									</Button>
									<Button onClick={handleSendMessage}>
										<Send className="mr-2 h-4 w-4" />
										Enviar
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</CardContent>
			</Card>

			{/* Layout de mensajes */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Lista de mensajes */}
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
												className={`cursor-pointer border-l-4 p-4 transition-colors hover:bg-muted/50 ${
													selectedMessage === message.id
														? "border-l-primary bg-muted"
														: message.read
															? "border-l-transparent"
															: "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
												}`}
												key={message.id}
												onClick={() => {
													setSelectedMessage(message.id);
													if (!message.read) {
														handleMarkAsRead(message.id);
													}
												}}
											>
												<div className="flex items-start justify-between">
													<div className="flex min-w-0 flex-1 items-center gap-3">
														<Avatar className="h-8 w-8">
															<AvatarImage src={message.sender.avatar} />
															<AvatarFallback>
																{message.sender.name
																	.split(" ")
																	.map((n) => n[0])
																	.join("")}
															</AvatarFallback>
														</Avatar>
														<div className="min-w-0 flex-1">
															<div className="flex items-center gap-2">
																<p className="truncate font-medium text-sm">
																	{message.sender.name}
																</p>
																{message.starred && (
																	<Star className="h-3 w-3 fill-current text-yellow-500" />
																)}
															</div>
															<p className="truncate font-medium text-sm">
																{message.subject}
															</p>
															<p className="truncate text-muted-foreground text-xs">
																{message.content}
															</p>
														</div>
													</div>
													<div className="flex flex-col items-end gap-1">
														<Badge
															className={`text-xs ${getMessageStatusColor(
																message.status
															)}`}
															variant="secondary"
														>
															{getMessageStatusIcon(message.status)}
														</Badge>
														<span className="text-muted-foreground text-xs">
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

				{/* Detalle del mensaje */}
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">
								{selectedMessageData
									? "Detalle del Mensaje"
									: "Selecciona un mensaje"}
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
												<p className="text-muted-foreground text-sm">
													{selectedMessageData.sender.email}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button
												disabled={processingIds.includes(
													selectedMessageData.id
												)}
												onClick={() => handleToggleStar(selectedMessageData.id)}
												size="sm"
												variant="outline"
											>
												{processingIds.includes(selectedMessageData.id) ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Star
														className={`h-4 w-4 ${
															selectedMessageData.starred
																? "fill-current text-yellow-500"
																: ""
														}`}
													/>
												)}
											</Button>
											<Button
												disabled={processingIds.includes(
													selectedMessageData.id
												)}
												onClick={() => handleArchive(selectedMessageData.id)}
												size="sm"
												variant="outline"
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

									{/* Asunto y metadatos */}
									<div className="space-y-2">
										<h3 className="font-semibold text-lg">
											{selectedMessageData.subject}
										</h3>
										<div className="flex items-center gap-4 text-muted-foreground text-sm">
											<span>
												📅 {formatDate(selectedMessageData.createdAt)}
											</span>
											<Badge
												className={getMessageStatusColor(
													selectedMessageData.status
												)}
												variant="secondary"
											>
												{getMessageStatusIcon(selectedMessageData.status)}{" "}
												{getMessageStatusLabel(selectedMessageData.status)}
											</Badge>
											{selectedMessageData.starred && (
												<Badge
													className="bg-yellow-100 text-yellow-800"
													variant="secondary"
												>
													⭐ Favorito
												</Badge>
											)}
										</div>
									</div>

									<Separator />

									{/* Contenido del mensaje */}
									<div className="prose prose-sm dark:prose-invert max-w-none">
										<div className="whitespace-pre-wrap">
											{selectedMessageData.content}
										</div>
									</div>

									{/* Adjuntos (si aplica) */}
									{selectedMessageData.attachments &&
										selectedMessageData.attachments.length > 0 && (
											<>
												<Separator />
												<div>
													<h4 className="mb-2 font-medium">
														Adjuntos ({selectedMessageData.attachments.length})
													</h4>
													<div className="space-y-2">
														{selectedMessageData.attachments.map(
															(attachment, index) => (
																<div
																	className="flex items-center gap-2 rounded border p-2"
																	key={index}
																>
																	<span>📎</span>
																	<span className="text-sm">
																		{attachment.name}
																	</span>
																	<span className="text-muted-foreground text-xs">
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
								<div className="py-12 text-center text-muted-foreground">
									<Send className="mx-auto mb-4 h-12 w-12 opacity-50" />
									<p>Selecciona un mensaje de la lista para ver sus detalles</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
