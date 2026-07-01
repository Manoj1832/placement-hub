// Deprecated in favor of Clerk authentication
export function useAuth() {
  console.warn("useAuth is deprecated. Please use Clerk's useUser or useAuth directly.");
  return null;
}
