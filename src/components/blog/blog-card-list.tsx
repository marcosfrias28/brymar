"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Calendar, Clock, User } from "lucide-react";
import Image from "next/image";
import { secondaryColorClasses } from '@/lib/utils/secondary-colors';
import { cn } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  coverImage: string;
  publishedDate: string;
  status: "draft" | "published";
  category: string;
  readTime: number;
  excerpt: string;
}

interface BlogCardListProps {
  post: BlogPost;
}

export function BlogCardList({ post }: BlogCardListProps) {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "inversiones":
        return "Inversiones";
      case "mercado":
        return "Mercado";
      case "consejos":
        return "Consejos";
      case "desarrollos":
        return "Desarrollos";
      case "noticias":
        return "Noticias";
      default:
        return category;
    }
  };

  return (
    <Card
      className={cn(
        "border-border shadow-sm transition-all duration-200",
        secondaryColorClasses.cardHover
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-32 sm:h-24 flex-shrink-0">
            <Image
              src={post.coverImage || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover rounded-l-lg"
            />
            <Badge
              className={cn(
                "absolute top-2 left-2 text-xs",
                post.status === "published"
                  ? "bg-green-600 text-white"
                  : cn("text-yellow-800", secondaryColorClasses.badge)
              )}
            >
              {post.status === "published" ? "Publicado" : "Borrador"}
            </Badge>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                  {post.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(post.publishedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime} min</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs mb-2",
                    secondaryColorClasses.badgeWithBorder
                  )}
                >
                  {getCategoryLabel(post.category)}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "h-7 px-2 text-xs",
                  secondaryColorClasses.interactive
                )}
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  "h-7 px-2 text-xs",
                  secondaryColorClasses.interactive
                )}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
