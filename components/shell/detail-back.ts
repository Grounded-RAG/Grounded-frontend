import { workspaceHref } from "@/lib/utils";

export function resolveDetailBack(pathname: string, workspaceSlug?: string) {
  if (pathname.endsWith("/datasets/new")) {
    return { href: workspaceHref(workspaceSlug, "/datasets"), label: "Datasets" };
  }
  if (/\/datasets\/[^/]+$/.test(pathname)) {
    return { href: workspaceHref(workspaceSlug, "/datasets"), label: "Datasets" };
  }
  if (pathname.endsWith("/agents/new")) {
    return { href: workspaceHref(workspaceSlug, "/agents"), label: "Agents" };
  }
  if (/\/agents\/[^/]+$/.test(pathname)) {
    return { href: workspaceHref(workspaceSlug, "/agents"), label: "Agents" };
  }
  return null;
}

export function isDetailRoute(pathname: string) {
  return resolveDetailBack(pathname) !== null;
}
