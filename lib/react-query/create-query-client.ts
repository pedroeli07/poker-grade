import { QueryClient } from "@tanstack/react-query";

export function createBrowserQueryClient() {
  return new QueryClient();
}
