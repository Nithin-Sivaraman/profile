import { AtSign, Briefcase, Camera, CodeXml, Globe, Link as LinkIcon, Mail, Play, type LucideIcon } from "lucide-react";

const CONTACT_ICONS: Record<string, LucideIcon> = {
  github: CodeXml,
  gitlab: CodeXml,
  linkedin: Briefcase,
  youtube: Play,
  instagram: Camera,
  twitter: AtSign,
  x: AtSign,
  email: Mail,
  website: Globe,
  blog: Globe,
};

export function contactIcon(type: string): LucideIcon {
  return CONTACT_ICONS[type.toLowerCase()] ?? LinkIcon;
}
