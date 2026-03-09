export interface SiteNavLink {
  href: string;
  label: string;
}

export const APP_NAV_LINKS: SiteNavLink[] = [
  { href: "/guia", label: "Guia" },
  { href: "/processo", label: "Meu Processo" },
  { href: "/documentos", label: "Documentos" },
  { href: "/modelos", label: "Modelos" },
  { href: "/downloads", label: "Downloads" },
  { href: "/suporte", label: "Suporte" },
  { href: "/noticias", label: "Noticias" },
];

export const LANDING_NAV_LINKS: SiteNavLink[] = [
  { href: "#beneficios", label: "Beneficios" },
  { href: "#como-funciona", label: "Como Funciona" },
  { href: "#base-legal", label: "Base Legal" },
  { href: "#faq", label: "FAQ" },
  { href: "/noticias", label: "Noticias" },
];

export const NEWS_NAV_LINKS: SiteNavLink[] = [
  { href: "/guia", label: "Meus Processos" },
  { href: "/documentos", label: "Documentos" },
  { href: "/modelos", label: "Modelos" },
  { href: "/suporte", label: "Suporte" },
  { href: "/noticias", label: "Noticias" },
];
