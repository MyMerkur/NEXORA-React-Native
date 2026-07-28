import type { ApplicationStatus } from "../../services/jobApi";
import type { BadgeVariant } from "../../components/Badge";

export function statusLabel(status: ApplicationStatus): string {
  if (status === "accepted") {
    return "Onaylandı";
  }
  if (status === "rejected") {
    return "Reddedildi";
  }
  return "Beklemede";
}

export function statusBadgeVariant(status: ApplicationStatus): BadgeVariant {
  if (status === "accepted") {
    return "success";
  }
  if (status === "rejected") {
    return "danger";
  }
  return "neutral";
}
