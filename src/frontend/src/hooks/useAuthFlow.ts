import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "unregistered"
  | "user"
  | "admin";

export function useAuthFlow() {
  const { identity, login, clear, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const qc = useQueryClient();

  useEffect(() => {
    if (isInitializing || isFetching) {
      setStatus("loading");
      return;
    }
    if (!identity) {
      setStatus("unauthenticated");
      return;
    }
    if (!actor) {
      setStatus("loading");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await actor.getCallerUserRole();
        if (cancelled) return;
        const isAdmin = await actor.isCallerAdmin();
        if (cancelled) return;
        setStatus(isAdmin ? "admin" : "user");
      } catch {
        if (!cancelled) setStatus("unregistered");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [identity, actor, isInitializing, isFetching]);

  const refresh = () => {
    qc.invalidateQueries();
    setStatus("loading");
  };

  return { status, identity, login, logout: clear, refresh };
}
