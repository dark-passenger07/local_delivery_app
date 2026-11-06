import { Dimensions, PixelRatio, Platform } from "react-native";
import { useWindowDimensions } from "react-native";

/**
 * Premium responsive helpers — single source of truth for all screens.
 *
 * Design baseline: iPhone 11 / Pixel 5 class phone (375 x 812).
 * - Phones (< 600dp width): scale gently, cap font growth.
 * - Tablets / foldables / web (>= 600dp): larger gutters, capped content width,
 *   slightly larger type, multi-column grids where supported.
 */

export const GUIDELINE_BASE_WIDTH = 375;
export const GUIDELINE_BASE_HEIGHT = 812;

export const TABLET_BREAKPOINT = 600;
export const LARGE_TABLET_BREAKPOINT = 900;

export const isTabletWidth = (width: number) => width >= TABLET_BREAKPOINT;
export const isLargeTabletWidth = (width: number) => width >= LARGE_TABLET_BREAKPOINT;
export const isSmallDeviceWidth = (width: number) => width < 360;

const { width: INIT_W, height: INIT_H } = Dimensions.get("window");

/** Width % of screen width, e.g. wp(90) = 90% of width */
export const wp = (percent: number, width = INIT_W) => {
  return PixelRatio.roundToNearestPixel((width * percent) / 100);
};

/** Height % of screen height */
export const hp = (percent: number, height = INIT_H) => {
  return PixelRatio.roundToNearestPixel((height * percent) / 100);
};

/**
 * Responsive font — scales with width but clamped so tablets don't explode
 * and small phones stay legible.
 * factor 0.5 = moderate scaling (recommended).
 */
export const rf = (size: number, width = INIT_W, factor = 0.5) => {
  const scale = width / GUIDELINE_BASE_WIDTH;
  // Clamp the scale so 320dp -> ~0.93x, 768dp -> ~1.35x max, 1024dp -> ~1.45x max
  const clampedScale = Math.min(Math.max(scale, 0.85), 1.45);
  const newSize = size + (size * clampedScale - size) * factor;
  const rounded = PixelRatio.roundToNearestPixel(newSize);
  if (Platform.OS === "android") return Math.max(rounded - 1, 10);
  return rounded;
};

/** Moderate scale for padding / radius / icon sizes */
export const ms = (size: number, width = INIT_W, factor = 0.5) => {
  const scale = width / GUIDELINE_BASE_WIDTH;
  const clampedScale = Math.min(Math.max(scale, 0.85), 1.4);
  return PixelRatio.roundToNearestPixel(size + (size * clampedScale - size) * factor);
};

/** Centered max content width — prevents stretched lines on tablets/web */
export const contentMaxWidth = (width: number) =>
  width >= LARGE_TABLET_BREAKPOINT ? 860 : width >= TABLET_BREAKPOINT ? 720 : width;

/** Horizontal gutter that grows on larger screens */
export const gutter = (width: number) =>
  width >= LARGE_TABLET_BREAKPOINT ? 32 : width >= TABLET_BREAKPOINT ? 28 : width < 360 ? 16 : 20;

/** Grid columns helper */
export const columnsFor = (width: number, phone = 1, tablet = 2, large = 3) =>
  width >= LARGE_TABLET_BREAKPOINT ? large : width >= TABLET_BREAKPOINT ? tablet : phone;

export interface Responsive {
  width: number;
  height: number;
  isTablet: boolean;
  isLargeTablet: boolean;
  isSmallDevice: boolean;
  isLandscape: boolean;
  wp: (p: number) => number;
  hp: (p: number) => number;
  rf: (s: number, f?: number) => number;
  ms: (s: number, f?: number) => number;
  gutter: number;
  maxWidth: number;
  columns: (phone?: number, tablet?: number, large?: number) => number;
}

/** Hook version — re-renders on rotation / resize (web, foldables, tablets). */
export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  const isTablet = isTabletWidth(width);
  const isLargeTablet = isLargeTabletWidth(width);
  const isSmallDevice = isSmallDeviceWidth(width);
  return {
    width,
    height,
    isTablet,
    isLargeTablet,
    isSmallDevice,
    isLandscape: width > height,
    wp: (p: number) => wp(p, width),
    hp: (p: number) => hp(p, height),
    rf: (s: number, f = 0.5) => rf(s, width, f),
    ms: (s: number, f = 0.5) => ms(s, width, f),
    gutter: gutter(width),
    maxWidth: contentMaxWidth(width),
    columns: (phone = 1, tablet = 2, large = 3) => columnsFor(width, phone, tablet, large),
  };
}
