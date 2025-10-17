"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { secondaryColorClasses } from "@/lib/utils/secondary-colors";
import Image from "next/image";
import Link from "next/link";

export interface CardAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
  variant?:
    | "default"
    | "outline"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

export interface CardBadge {
  label: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export interface UnifiedCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  badges?: CardBadge[];
  actions?: CardAction[];
  metadata?: Array<{
    icon?: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
  }>;
  href?: string;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  onClick?: () => void;
}

export function UnifiedCard({
  title,
  subtitle,
  description,
  image,
  imageAlt,
  badges = [],
  actions = [],
  metadata = [],
  href,
  className,
  imageClassName,
  contentClassName,
  footerClassName,
  onClick,
}: UnifiedCardProps) {
  const CardWrapper = href ? Link : "div";
  const cardProps = href ? { href } : onClick ? { onClick } : {};

  return (
    <CardWrapper {...(cardProps as any)}>
      <Card
        className={cn(
          "group transition-all duration-200 hover:shadow-lg border-border",
          secondaryColorClasses.cardHover,
          onClick && "cursor-pointer",
          className
        )}
      >
        {image && (
          <div
            className={cn(
              "relative w-full h-48 overflow-hidden rounded-t-lg",
              imageClassName
            )}
          >
            <Image
              src={image}
              alt={imageAlt || title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {badges.length > 0 && (
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                {badges.slice(0, 2).map((badge, index) => (
                  <Badge
                    key={index}
                    variant={badge.variant}
                    className={cn("text-xs", badge.className)}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        <CardContent className={cn("p-4", contentClassName)}>
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {description}
              </p>
            )}

            {!image && badges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant={badge.variant}
                    className={cn("text-xs", badge.className)}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}

            {metadata.length > 0 && (
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {metadata.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {item.icon && <item.icon className="h-3 w-3" />}
                    <span className="font-medium">{item.label}:</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        {actions.length > 0 && (
          <CardFooter className={cn("p-4 pt-0 flex gap-2", footerClassName)}>
            {actions.map((action, index) => {
              const ActionWrapper = action.href ? Link : "div";
              const actionProps = action.href ? { href: action.href } : {};

              return (
                <ActionWrapper key={index} {...(actionProps as any)}>
                  <Button
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={action.onClick}
                    className={cn("flex-1", action.className)}
                  >
                    {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                    {action.label}
                  </Button>
                </ActionWrapper>
              );
            })}
          </CardFooter>
        )}
      </Card>
    </CardWrapper>
  );
}
