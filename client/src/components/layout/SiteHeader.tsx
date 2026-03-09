import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

import { Container } from "@/components/ui/container";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import type { SiteNavLink } from "./site-nav";

type MenuSlot = ReactNode | ((closeMenu: () => void) => ReactNode);

interface SiteHeaderProps {
  links?: SiteNavLink[];
  activeHref?: string;
  logoHref?: string;
  logoLabel?: string;
  hideLogoTextOnMobile?: boolean;
  desktopNavExtra?: ReactNode;
  desktopSearch?: ReactNode;
  rightContent?: ReactNode;
  mobileQuickActions?: ReactNode;
  mobileMenuTop?: MenuSlot;
  mobileMenuBottom?: MenuSlot;
}

const headerStyle = {
  backgroundColor: "rgba(18, 17, 13, 0.5)",
  borderColor: "rgba(211, 158, 23, 0.2)",
} as const;

function renderMenuSlot(slot: MenuSlot | undefined, closeMenu: () => void) {
  if (!slot) return null;
  return typeof slot === "function" ? slot(closeMenu) : slot;
}

export function SiteHeader({
  links = [],
  activeHref,
  logoHref = "/",
  logoLabel = "CPF Blindado",
  hideLogoTextOnMobile = true,
  desktopNavExtra,
  desktopSearch,
  rightContent,
  mobileQuickActions,
  mobileMenuTop,
  mobileMenuBottom,
}: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const hasMenu = links.length > 0 || !!mobileMenuTop || !!mobileMenuBottom;
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-[6px]" style={headerStyle}>
      <Container
        as="div"
        maxWidth="xl"
        className="flex items-center justify-between gap-3 py-4"
      >
        <div className="flex min-w-0 items-center gap-3 md:gap-8">
          <a href={logoHref} className="flex min-w-0 items-center gap-2 md:gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center md:h-8 md:w-8">
              <svg
                width="27"
                height="29"
                viewBox="0 0 27 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
              >
                <path d="M13.5 0L26.5 8V21L13.5 29L0.5 21V8L13.5 0Z" fill="#d39e17" />
                <path d="M13.5 6L20 10V19L13.5 23L7 19V10L13.5 6Z" fill="#12110d" />
              </svg>
            </div>
            <h2
              className={cn(
                "truncate text-lg font-bold whitespace-nowrap md:text-xl",
                hideLogoTextOnMobile && "hidden sm:block",
              )}
              style={{ color: "#f1f5f9", letterSpacing: "-0.3px" }}
            >
              {logoLabel.split(" ").slice(0, -1).join(" ")}{" "}
              <span style={{ color: "#d39e17" }}>{logoLabel.split(" ").slice(-1)}</span>
            </h2>
          </a>

          {links.length > 0 && (
            <nav className="hidden items-center gap-6 md:flex">
              {links.map((link) => {
                const isActive = activeHref === link.href;

                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium transition-colors hover:text-[#d39e17]"
                    style={{ color: isActive ? "#d39e17" : "#cbd5e1" }}
                  >
                    {link.label}
                  </a>
                );
              })}
              {desktopNavExtra}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {desktopSearch && <div className="hidden lg:block">{desktopSearch}</div>}
          {mobileQuickActions && <div className="md:hidden">{mobileQuickActions}</div>}
          {rightContent}
          {hasMenu && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border text-[#f1f5f9] transition-colors hover:bg-white/5 md:hidden"
                style={{ borderColor: "rgba(211, 158, 23, 0.25)" }}
                aria-label="Abrir menu"
              >
                <Menu size={18} />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[88vw] border-l p-0 sm:max-w-sm"
                style={{
                  backgroundColor: "rgba(18, 17, 13, 0.98)",
                  borderColor: "rgba(211, 158, 23, 0.2)",
                }}
              >
                <SheetHeader className="border-b" style={{ borderColor: "rgba(211, 158, 23, 0.12)" }}>
                  <SheetTitle style={{ color: "#f1f5f9" }}>Navegacao</SheetTitle>
                  <SheetDescription style={{ color: "#94a3b8" }}>
                    Acesse as principais areas da plataforma.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-1 flex-col overflow-y-auto p-4">
                  {renderMenuSlot(mobileMenuTop, closeMenu)}

                  {links.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {links.map((link) => {
                        const isActive = activeHref === link.href;

                        return (
                          <SheetClose key={link.href} asChild>
                            <a
                              href={link.href}
                              className="flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors"
                              style={{
                                color: isActive ? "#12110d" : "#e2e8f0",
                                backgroundColor: isActive ? "#d39e17" : "rgba(22, 40, 71, 0.75)",
                                borderColor: isActive
                                  ? "#d39e17"
                                  : "rgba(211, 158, 23, 0.15)",
                              }}
                            >
                              <span>{link.label}</span>
                              <span style={{ color: isActive ? "#12110d" : "#64748b" }}>›</span>
                            </a>
                          </SheetClose>
                        );
                      })}
                    </div>
                  )}

                  {desktopNavExtra && (
                    <div className="mt-4 flex flex-wrap gap-2">{desktopNavExtra}</div>
                  )}

                  {mobileMenuBottom && (
                    <div className="mt-6 border-t pt-4" style={{ borderColor: "rgba(211, 158, 23, 0.12)" }}>
                      {renderMenuSlot(mobileMenuBottom, closeMenu)}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </Container>
    </header>
  );
}
