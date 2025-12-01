"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, History, User, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  const navigation = [
    {
      name: "ホーム",
      href: "/",
      icon: Home,
    },
    {
      name: "備品一覧",
      href: "/equipment",
      icon: Package,
    },
    {
      name: "貸出履歴",
      href: "/loans",
      icon: History,
    },
    {
      name: "マイページ",
      href: "/my-loans",
      icon: User,
    },
  ];

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Package className="w-6 h-6" />
            <span>備品管理</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
