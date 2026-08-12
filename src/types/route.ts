import { UserRole } from ".";

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  roles: UserRole[];
  requiresAuth: boolean;
  requiresPasswordChange?: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  roles: UserRole[];
  children?: NavigationItem[];
}
