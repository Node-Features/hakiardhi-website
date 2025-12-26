"use client";

import React from "react";
import Image from "next/image";

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-8 w-8", text: "text-xs", image: 32 },
  md: { container: "h-11 w-11", text: "text-sm", image: 44 },
  lg: { container: "h-16 w-16", text: "text-xl", image: 64 },
  xl: { container: "h-24 w-24", text: "text-3xl", image: 96 },
};

/**
 * Get initials from first and last name
 */
function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || "";
  const last = lastName?.charAt(0)?.toUpperCase() || "";

  if (first && last) {
    return `${first}${last}`;
  }
  if (first) {
    return first;
  }
  return "U"; // Default to "U" for User
}

/**
 * Generate a consistent background color based on user's name
 */
function getAvatarColor(firstName?: string, lastName?: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];

  const name = `${firstName || ""}${lastName || ""}`;
  const charCodeSum = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const colorIndex = charCodeSum % colors.length;

  return colors[colorIndex];
}

/**
 * UserAvatar component
 * Displays user profile picture or initials fallback
 */
export default function UserAvatar({
  firstName,
  lastName,
  imageUrl,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const { container, text, image } = sizeMap[size];
  const initials = getInitials(firstName, lastName);
  const bgColor = getAvatarColor(firstName, lastName);

  // If user has a profile photo, display it
  if (imageUrl) {
    return (
      <div className={`${container} overflow-hidden rounded-full ${className}`}>
        <Image
          width={image}
          height={image}
          src={imageUrl}
          alt={`${firstName || ""} ${lastName || ""}`.trim() || "User"}
          className="object-cover w-full h-full"
          onError={(e) => {
            // If image fails to load, hide it and show initials
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div
      className={`${container} ${bgColor} rounded-full flex items-center justify-center ${className}`}
    >
      <span className={`${text} font-semibold text-white`}>{initials}</span>
    </div>
  );
}
