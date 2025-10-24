// Re-export useAuth as useUser for convenience and backward compatibility

export type { AuthContextValue as UseUserReturn } from "@/components/providers/auth-provider";
export { useAuth as useUser } from "@/components/providers/auth-provider";
