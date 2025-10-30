"use client";

import {
	Calendar,
	DollarSign,
	Edit,
	Eye,
	MapPin,
	MoreVertical,
	Ruler,
	Tag,
	Trash2,
	User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type UniversalCardProps = {
	id: string;
	title: string;
	description?: string;
	image?: string;
	type: "property" | "land" | "blog";
	status?: string;
	price?: number;
	location?: string;
	area?: number;
	author?: string;
	date?: string;
	category?: string;
	readTime?: number;
	bedrooms?: number;
	bathrooms?: number;
	viewMode: "grid" | "list" | "bento";
	onEdit?: () => void;
	onDelete?: () => void;
	onView?: () => void;
};

export function UniversalCard({
	id,
	title,
	description,
	image,
	type,
	status,
	price,
	location,
	area,
	author,
	date,
	category,
	readTime,
	bedrooms,
	bathrooms,
	viewMode,
	onEdit,
	onDelete,
	onView,
}: UniversalCardProps) {
	const [imageError, setImageError] = useState(false);

	const getDetailUrl = () => {
		switch (type) {
			case "property":
				return `/dashboard/properties/${id}`;
			case "land":
				return `/dashboard/lands/${id}`;
			case "blog":
				return `/dashboard/blog/${id}`;
			default:
				return "#";
		}
	};

	const getStatusColor = (status?: string) => {
		switch (status) {
			case "published":
			case "available":
				return "bg-green-100 text-green-800";
			case "draft":
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "sold":
			case "rented":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatPrice = (price?: number) => {
		if (!price) {
			return "";
		}
		return new Intl.NumberFormat("es-DO", {
			style: "currency",
			currency: "DOP",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const formatArea = (area?: number) => {
		if (!area) {
			return "";
		}
		return `${area.toLocaleString()} m²`;
	};

	if (viewMode === "list") {
		return (
			<div className="rounded-lg border border-border bg-background p-4 transition-shadow hover:shadow-md">
				<div className="flex gap-4">
					{/* Image */}
					<Link className="h-24 w-24 flex-shrink-0" href={getDetailUrl()}>
						{image && !imageError ? (
							<Image
								alt={title}
								className="h-full w-full rounded-lg object-cover transition-opacity hover:opacity-90"
								height={96}
								onError={() => setImageError(true)}
								src={image || "/placeholder.svg"}
								width={96}
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/80">
								<span className="font-medium text-muted-foreground text-xs">
									Sin imagen
								</span>
							</div>
						)}
					</Link>

					{/* Content */}
					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-2">
							<div className="min-w-0 flex-1">
								<Link href={getDetailUrl()}>
									<h3 className="cursor-pointer truncate font-semibold text-foreground transition-colors hover:text-primary">
										{title}
									</h3>
								</Link>
								{description && (
									<p className="mt-1 line-clamp-2 text-blackCoral/70 text-sm">
										{description}
									</p>
								)}
							</div>

							{/* Actions */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button className="h-8 w-8 p-0" size="sm" variant="ghost">
										<MoreVertical className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem asChild>
										<Link href={getDetailUrl()}>
											<Eye className="mr-2 h-4 w-4" />
											Ver Detalles
										</Link>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href={`${getDetailUrl()}?edit=true`}>
											<Edit className="mr-2 h-4 w-4" />
											Editar
										</Link>
									</DropdownMenuItem>
									{onDelete && (
										<DropdownMenuItem
											className="text-red-600"
											onClick={onDelete}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Eliminar
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Metadata */}
						<div className="mt-2 flex flex-wrap items-center gap-3">
							{status && (
								<Badge className={getStatusColor(status)} variant="secondary">
									{status}
								</Badge>
							)}

							{price && (
								<div className="flex items-center gap-1 text-blackCoral text-sm">
									<DollarSign className="h-3 w-3" />
									{formatPrice(price)}
								</div>
							)}

							{area && (
								<div className="flex items-center gap-1 text-blackCoral text-sm">
									<Ruler className="h-3 w-3" />
									{formatArea(area)}
								</div>
							)}

							{location && (
								<div className="flex items-center gap-1 text-blackCoral text-sm">
									<MapPin className="h-3 w-3" />
									{location}
								</div>
							)}

							{author && (
								<div className="flex items-center gap-1 text-blackCoral text-sm">
									<User className="h-3 w-3" />
									{author}
								</div>
							)}

							{date && (
								<div className="flex items-center gap-1 text-blackCoral text-sm">
									<Calendar className="h-3 w-3" />
									{date}
								</div>
							)}

							{category && (
								<div className="flex items-center gap-1 text-blackCoral text-sm">
									<Tag className="h-3 w-3" />
									{category}
								</div>
							)}

							{readTime && (
								<span className="text-blackCoral text-sm">
									{readTime} min lectura
								</span>
							)}

							{bedrooms && (
								<span className="text-blackCoral text-sm">{bedrooms} hab</span>
							)}

							{bathrooms && (
								<span className="text-blackCoral text-sm">
									{bathrooms} baños
								</span>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Grid and Bento modes
	const cardHeight = viewMode === "bento" ? "h-auto" : "h-80";

	return (
		<div
			className={`overflow-hidden rounded-lg border border-blackCoral bg-white transition-shadow hover:shadow-md ${cardHeight}`}
		>
			{/* Image */}
			<Link className="relative block h-48" href={getDetailUrl()}>
				{image && !imageError ? (
					<Image
						alt={title}
						className="object-cover transition-opacity hover:opacity-90"
						fill
						onError={() => setImageError(true)}
						src={image || "/placeholder.svg"}
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-blackCoral transition-colors hover:bg-arsenic">
						<span className="font-medium text-white">Sin imagen</span>
					</div>
				)}

				{/* Status badge */}
				{status && (
					<Badge
						className={`absolute top-2 left-2 ${getStatusColor(status)}`}
						variant="secondary"
					>
						{status}
					</Badge>
				)}

				{/* Actions */}
				<div
					className="absolute top-2 right-2"
					onClick={(e) => e.preventDefault()}
				>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="h-8 w-8 bg-white/90 p-0 hover:bg-white"
								size="sm"
								variant="secondary"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link href={getDetailUrl()}>
									<Eye className="mr-2 h-4 w-4" />
									Ver Detalles
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href={`${getDetailUrl()}?edit=true`}>
									<Edit className="mr-2 h-4 w-4" />
									Editar
								</Link>
							</DropdownMenuItem>
							{onDelete && (
								<DropdownMenuItem className="text-red-600" onClick={onDelete}>
									<Trash2 className="mr-2 h-4 w-4" />
									Eliminar
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</Link>

			{/* Content */}
			<div className="p-4">
				<Link href={getDetailUrl()}>
					<h3 className="mb-2 line-clamp-2 cursor-pointer font-semibold text-arsenic transition-colors hover:text-blackCoral">
						{title}
					</h3>
				</Link>

				{description && (
					<p className="mb-3 line-clamp-2 text-blackCoral/70 text-sm">
						{description}
					</p>
				)}

				{/* Metadata */}
				<div className="space-y-2">
					{price && (
						<div className="flex items-center gap-1 font-medium text-arsenic text-sm">
							<DollarSign className="h-3 w-3" />
							{formatPrice(price)}
						</div>
					)}

					<div className="flex flex-wrap items-center gap-2 text-blackCoral text-xs">
						{area && (
							<div className="flex items-center gap-1">
								<Ruler className="h-3 w-3" />
								{formatArea(area)}
							</div>
						)}

						{location && (
							<div className="flex items-center gap-1">
								<MapPin className="h-3 w-3" />
								{location}
							</div>
						)}

						{author && (
							<div className="flex items-center gap-1">
								<User className="h-3 w-3" />
								{author}
							</div>
						)}

						{date && (
							<div className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								{date}
							</div>
						)}

						{category && (
							<div className="flex items-center gap-1">
								<Tag className="h-3 w-3" />
								{category}
							</div>
						)}

						{readTime && <span>{readTime} min</span>}
						{bedrooms && <span>{bedrooms} hab</span>}
						{bathrooms && <span>{bathrooms} baños</span>}
					</div>
				</div>
			</div>
		</div>
	);
}
