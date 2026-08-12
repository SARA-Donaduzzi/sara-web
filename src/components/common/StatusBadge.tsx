"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArticleStatus } from "@/types";
import { getStatusLabel, getStatusColor } from "@/lib/constants";

interface StatusBadgeProps {
  status: ArticleStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = getStatusLabel(status);
  const colorClass = getStatusColor(status);
  
  return (
    <Badge
      variant="secondary"
      className={cn("text-xs font-medium", colorClass, className)}
    >
      {label}
    </Badge>
  );
}
