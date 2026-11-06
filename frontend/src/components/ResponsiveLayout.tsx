import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsive } from "../utils/responsive";

/**
 * Centered responsive page wrapper.
 * - Caps content width on tablets / web so UI doesn't stretch.
 * - Applies adaptive horizontal gutter.
 */
export function CenteredContainer({
  children,
  style,
  maxWidthOverride,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidthOverride?: number;
}) {
  const { maxWidth, gutter } = useResponsive();
  return (
    <View
      style={[
        styles.outer,
        { paddingHorizontal: gutter },
        style,
      ]}
    >
      <View style={[styles.inner, { maxWidth: maxWidthOverride ?? maxWidth }]}>
        {children}
      </View>
    </View>
  );
}

export function useBottomInsetWithFab(fabHeight = 56, gap = 24) {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 16) + fabHeight + gap;
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    alignItems: "stretch",
  },
  inner: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
});
