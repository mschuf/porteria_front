import {
  Badge, BadgeCheck, Building, Building2, CircleUserRound, Contact, CreditCard, DoorClosed,
  DoorOpen, Factory, Fingerprint, IdCard, KeyRound, Landmark, LockKeyhole, MapPin, ScanFace,
  Shield, ShieldCheck, Tag, TicketCheck, UserRoundCheck, Warehouse, type LucideIcon,
} from "lucide-react";
import type { TarjetaIcono } from "@/api/tarjetas";

export const TARJETA_ICON_COMPONENTS: Record<TarjetaIcono, LucideIcon> = {
  Badge, BadgeCheck, Building, Building2, CircleUserRound, Contact, CreditCard, DoorClosed,
  DoorOpen, Factory, Fingerprint, IdCard, KeyRound, Landmark, LockKeyhole, MapPin, ScanFace,
  Shield, ShieldCheck, Tag, TicketCheck, UserRoundCheck, Warehouse,
};
