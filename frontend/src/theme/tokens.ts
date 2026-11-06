import { Platform } from "react-native";

/**
 * Premium design tokens — unified palette, spacing, radius, shadows, type.
 * All screens should import from here instead of hardcoding hex values.
 */

export const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primarySoft: "#E8EEFE",
  primaryMuted: "#93C5FD",

  bg: "#F4F6FB",
  card: "#FFFFFF",
  inputBg: "#F8FAFC",

  ink: "#0F172A",
  inkSoft: "#475569",
  inkMuted: "#94A3B8",

  border: "#E2E8F0",
  borderSoft: "#EEF1F8",

  success: "#16A34A",
  successSoft: "#DCFCE7",
  warning: "#F59E0B",
  warningSoft: "#FEF3C7",
  danger: "#EF4444",
  dangerSoft: "#FEE2E2",
  info: "#3B82F6",
  infoSoft: "#DBEAFE",
  purple: "#7C3AED",
  purpleSoft: "#EDE9FE",

  white: "#FFFFFF",
  heroGreen: "#065F46",
} as const;

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  full: 999,
} as const;

export const SHADOWS = {
  card: Platform.select({
    ios: {
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    android: { elevation: 2 },
    default: { elevation: 2 },
  }),
  button: Platform.select({
    ios: {
      shadowColor: "#2563EB",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    android: { elevation: 3 },
    default: { elevation: 3 },
  }),
  none: Platform.select({
    ios: {
      shadowOpacity: 0,
      shadowRadius: 0,
      shadowOffset: { width: 0, height: 0 },
    },
    android: { elevation: 0 },
    default: { elevation: 0 },
  }),
} as const;

/** Base font sizes (before rf scaling) */
export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  hero: 30,
} as const;

export const LAYOUT = {
  maxContentWidthPhone: 520,
  maxContentWidthTablet: 720,
  maxContentWidthLarge: 860,
  fabBottomOffset: 28,
} as const;
