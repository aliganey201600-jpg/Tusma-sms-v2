export type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export const ROLE_ROUTES: Record<Role, string[]> = {
  SUPER_ADMIN: ["/dashboard/super-admin", "/dashboard/messages"],
  ADMIN: ["/dashboard/admin", "/dashboard/messages"],
  TEACHER: ["/dashboard/teacher", "/dashboard/messages"],
  STUDENT: ["/dashboard/student", "/dashboard/messages"],
  PARENT: ["/dashboard/parent", "/dashboard/messages"],
};

export function isAuthorized(role: Role, path: string): boolean {
  const allowedRoutes = ROLE_ROUTES[role] || [];
  return allowedRoutes.some(route => path.startsWith(route));
}
