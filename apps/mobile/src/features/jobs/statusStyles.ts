import { colors } from "@nexora/ui-tokens";
import type { ApplicationStatus } from "../../services/jobApi";

export function statusColor(status: ApplicationStatus): string {
  if (status === "accepted") {
    return colors.success;
  }
  if (status === "rejected") {
    return colors.danger;
  }
  return colors.textSecondary;
}

export function statusLabel(status: ApplicationStatus): string {
  if (status === "accepted") {
    return "Onaylandı";
  }
  if (status === "rejected") {
    return "Reddedildi";
  }
  return "Beklemede";
}
