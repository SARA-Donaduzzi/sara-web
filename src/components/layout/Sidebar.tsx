"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  ClipboardList,
  X,
  User,
  LogOut,
} from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";
import { ROUTES, USER_ROLES } from "@/lib/constants";
import { getInitials } from "@/lib/auth";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    roles: [USER_ROLES.STUDENT, USER_ROLES.EVALUATOR, USER_ROLES.COORDINATOR],
  },
  {
    title: "Eventos",
    href: ROUTES.EVENTS,
    icon: Calendar,
    roles: [USER_ROLES.COORDINATOR, USER_ROLES.STUDENT],
  },
  {
    title: "Artigos",
    href: ROUTES.ARTICLES,
    icon: FileText,
    roles: [USER_ROLES.STUDENT, USER_ROLES.EVALUATOR],
  },
  {
    title: "Usuários",
    href: ROUTES.USERS,
    icon: Users,
    roles: [USER_ROLES.COORDINATOR],
  },
  {
    title: "Checklists",
    href: ROUTES.CHECKLISTS,
    icon: ClipboardList,
    roles: [USER_ROLES.COORDINATOR],
  },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, logout } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const userNavigationItems = navigationItems.filter((item) =>
    item.roles.includes(user.role)
  );

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
  };

  const handleProfile = () => {
    router.push(ROUTES.PROFILE);
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - SEMPRE FIXO */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header do Sidebar */}
        <div className="flex justify-center items-center p-4 border-b border-gray-200">
          <Image
            src="/images/faculdade-donaduzzi-removebg.png"
            alt="Logo SARA - Donaduzzi"
            width={180}
            height={70}
            className="object-contain"
            style={{ width: "auto", height: "auto" }}
            priority
          />

          {/* Botão fechar apenas no mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Área de Navegação com Scroll */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {userNavigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                      active
                        ? "btn-gradient-primary text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.title}
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <Separator className="my-4" />
          </ScrollArea>

          {/* Menu do Usuário na parte inferior */}
          <div className="p-3 border-t border-gray-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto hover:bg-gray-100"
                >
                  <div className="flex items-center w-full">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarFallback className="ia360-gradient-primary text-white text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium max-w-[170px] truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-white border border-gray-200 shadow-lg rounded-md p-1"
                align="end"
                side="right"
                sideOffset={8}
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none max-w-[170px] truncate">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  );
}
