"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getApiMisconfigurationMessage, isProductionApiMisconfigured } from "@/lib/api-base-url";
import { ApiError, authenticateWithApiKey, listWorkspaces } from "@/lib/api";
import type { AuthSmokeResponse, EmailAuthResponse, Workspace } from "@/lib/types";

const API_KEY_STORAGE_KEY = "grounded_api_key";
const WORKSPACE_ID_STORAGE_KEY = "grounded_workspace_id";
const WORKSPACE_NAME_STORAGE_KEY = "grounded_workspace_name";
const WORKSPACE_SLUG_STORAGE_KEY = "grounded_workspace_slug";
const RESTORE_TIMEOUT_MS = 15_000;

function readStorage(key: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeStorage(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  if (value === null) window.localStorage.removeItem(key);
  else window.localStorage.setItem(key, value);
}

interface AuthContextValue {
  apiKey: string | null;
  auth: AuthSmokeResponse | null;
  isLoading: boolean;
  restoreError: string | null;
  workspaces: Workspace[];
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceSlug: string | null;
  signInWithApiKey: (apiKey: string) => Promise<AuthSmokeResponse>;
  acceptEmailAuth: (response: EmailAuthResponse) => void;
  refreshWorkspaces: () => Promise<Workspace[]>;
  setWorkspace: (workspaceId: string | null, workspaceName?: string | null, workspaceSlug?: string | null) => void;
  signOut: () => void;
  clearRestoreError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const missingProviderMessage = "useAuth must be used within AuthProvider";

function createUnauthenticatedAuth(): AuthContextValue {
  const noop = () => undefined;
  const asyncEmpty = async () => [] as Workspace[];
  const asyncReject = async () => {
    throw new Error(missingProviderMessage);
  };

  return {
    apiKey: null,
    auth: null,
    isLoading: false,
    restoreError: null,
    workspaces: [],
    workspaceId: null,
    workspaceName: null,
    workspaceSlug: null,
    signInWithApiKey: asyncReject,
    acceptEmailAuth: noop,
    refreshWorkspaces: asyncEmpty,
    setWorkspace: noop,
    signOut: noop,
    clearRestoreError: noop,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [auth, setAuth] = useState<AuthSmokeResponse | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const freshSessionRef = useRef(false);

  useEffect(() => {
    const storedKey = readStorage(API_KEY_STORAGE_KEY);
    setApiKey(storedKey);
    setWorkspaceId(readStorage(WORKSPACE_ID_STORAGE_KEY));
    setWorkspaceName(readStorage(WORKSPACE_NAME_STORAGE_KEY));
    setWorkspaceSlug(readStorage(WORKSPACE_SLUG_STORAGE_KEY));
    setHydrated(true);
    if (storedKey) setIsLoading(true);
  }, []);

  useEffect(() => {
    if (hydrated) return;
    const timeout = window.setTimeout(() => setHydrated(true), 2_000);
    return () => window.clearTimeout(timeout);
  }, [hydrated]);

  const setWorkspace = useCallback((nextWorkspaceId: string | null, nextWorkspaceName?: string | null, nextWorkspaceSlug?: string | null) => {
    setWorkspaceId(nextWorkspaceId);
    setWorkspaceName(nextWorkspaceName ?? null);
    setWorkspaceSlug(nextWorkspaceSlug ?? null);
    writeStorage(WORKSPACE_ID_STORAGE_KEY, nextWorkspaceId);
    writeStorage(WORKSPACE_NAME_STORAGE_KEY, nextWorkspaceName ?? null);
    writeStorage(WORKSPACE_SLUG_STORAGE_KEY, nextWorkspaceSlug ?? null);
  }, []);

  const refreshWorkspaces = useCallback(async () => {
    if (!apiKey) return [];
    const rows = await listWorkspaces(apiKey);
    setWorkspaces(rows);
    const selected = rows.find((workspace) => workspace.workspace_id === workspaceId) ?? rows[0];
    if (selected && selected.workspace_id !== workspaceId) {
      setWorkspace(selected.workspace_id, selected.name, selected.slug);
    }
    return rows;
  }, [apiKey, setWorkspace, workspaceId]);

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    async function restore() {
      if (!apiKey) {
        setIsLoading(false);
        setAuth(null);
        setRestoreError(null);
        return;
      }
      if (isProductionApiMisconfigured()) {
        setRestoreError(getApiMisconfigurationMessage());
        setIsLoading(false);
        return;
      }

      if (freshSessionRef.current) {
        freshSessionRef.current = false;
        setRestoreError(null);
        if (workspaces.length === 0) {
          setIsLoading(true);
          try {
            const rows = await listWorkspaces(apiKey);
            if (cancelled) return;
            setWorkspaces(rows);
            const storedWorkspaceId = readStorage(WORKSPACE_ID_STORAGE_KEY);
            const selected =
              rows.find((workspace) => workspace.workspace_id === storedWorkspaceId) ?? rows[0];
            if (selected) {
              setWorkspace(selected.workspace_id, selected.name, selected.slug);
            }
          } catch {
            // Keep the authenticated session even if workspace listing fails.
          } finally {
            if (!cancelled) setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      setRestoreError(null);
      try {
        const restoreWork = async () => {
          const authenticated = await authenticateWithApiKey(apiKey);
          if (cancelled) return;
          setAuth(authenticated);
          const rows = await listWorkspaces(apiKey);
          if (cancelled) return;
          setWorkspaces(rows);
          const storedWorkspaceId = readStorage(WORKSPACE_ID_STORAGE_KEY);
          const selected = rows.find((workspace) => workspace.workspace_id === storedWorkspaceId) ?? rows[0];
          if (selected) {
            setWorkspace(selected.workspace_id, selected.name, selected.slug);
          }
        };
        const timeout = new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("Session restore timed out. Sign in again.")), RESTORE_TIMEOUT_MS);
        });
        await Promise.race([restoreWork(), timeout]);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof ApiError
            ? error.detail
            : error instanceof Error
              ? error.message
              : "Unable to restore session";
          setRestoreError(message);
          writeStorage(API_KEY_STORAGE_KEY, null);
          setApiKey(null);
          setAuth(null);
          setWorkspaces([]);
          setWorkspace(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void restore();
    return () => { cancelled = true; };
  }, [apiKey, hydrated, setWorkspace, workspaces.length]);

  const signInWithApiKey = useCallback(async (rawApiKey: string) => {
    const trimmed = rawApiKey.trim();
    freshSessionRef.current = true;
    const authenticated = await authenticateWithApiKey(trimmed);
    writeStorage(API_KEY_STORAGE_KEY, trimmed);
    setApiKey(trimmed);
    setAuth(authenticated);
    setRestoreError(null);
    const rows = await listWorkspaces(trimmed);
    setWorkspaces(rows);
    const selected = rows[0];
    if (selected) setWorkspace(selected.workspace_id, selected.name, selected.slug);
    return authenticated;
  }, [setWorkspace]);

  const acceptEmailAuth = useCallback((response: EmailAuthResponse) => {
    freshSessionRef.current = true;
    writeStorage(API_KEY_STORAGE_KEY, response.api_key);
    setApiKey(response.api_key);
    setAuth(response);
    setRestoreError(null);
    setWorkspace(response.workspace_id, response.workspace_name, response.workspace_slug);
  }, [setWorkspace]);

  const signOut = useCallback(() => {
    freshSessionRef.current = false;
    writeStorage(API_KEY_STORAGE_KEY, null);
    setApiKey(null);
    setAuth(null);
    setWorkspaces([]);
    setWorkspace(null);
    setRestoreError(null);
  }, [setWorkspace]);

  const clearRestoreError = useCallback(() => setRestoreError(null), []);

  const value = useMemo<AuthContextValue>(() => ({
    apiKey,
    auth,
    isLoading: hydrated && isLoading,
    restoreError,
    workspaces,
    workspaceId,
    workspaceName,
    workspaceSlug,
    signInWithApiKey,
    acceptEmailAuth,
    refreshWorkspaces,
    setWorkspace,
    signOut,
    clearRestoreError,
  }), [apiKey, auth, hydrated, isLoading, restoreError, workspaces, workspaceId, workspaceName, workspaceSlug, signInWithApiKey, acceptEmailAuth, refreshWorkspaces, setWorkspace, signOut, clearRestoreError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (value) return value;
  return createUnauthenticatedAuth();
}
