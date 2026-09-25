import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

// A single product price-change record as returned by
// GET /product/price-history/:id. Prisma Decimals serialize to strings, and
// oldPrice is null on the seeded creation entry (there was no price before the
// product existed).
export interface ProductPriceHistoryEntry {
  id: string;
  oldPrice: string | null;
  newPrice: string;
  changedAt: string;
}

interface PriceHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  productName?: string;
  unit?: string;
  entries: ProductPriceHistoryEntry[];
  loading: boolean;
  error?: string | null;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Manual formatting keeps this independent of the device's Intl support.
const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
};

const formatMoney = (value: string | number): string => `₹${(Number(value) || 0).toFixed(2)}`;

const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({
  visible,
  onClose,
  productName,
  unit,
  entries,
  loading,
  error,
}) => {
  const unitLabel = unit ? unit.toLowerCase() : 'unit';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Price history</Text>
          {productName ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {productName} · per {unitLabel}
            </Text>
          ) : null}

          <View style={styles.body}>
            {loading ? (
              <View style={styles.stateWrap}>
                <ActivityIndicator size="small" color="#6366F1" />
                <Text style={styles.stateText}>Loading history…</Text>
              </View>
            ) : error ? (
              <View style={styles.stateWrap}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : entries.length === 0 ? (
              <View style={styles.stateWrap}>
                <Text style={styles.stateText}>No price changes recorded yet.</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {entries.map((entry) => {
                  const isCreation = entry.oldPrice === null || entry.oldPrice === undefined;
                  const oldNum = Number(entry.oldPrice);
                  const newNum = Number(entry.newPrice);
                  const delta = isCreation ? 0 : newNum - oldNum;
                  const increased = delta > 0;

                  return (
                    <View key={entry.id} style={styles.row}>
                      <View style={styles.timelineCol}>
                        <View style={[styles.dot, isCreation && styles.dotCreation]} />
                      </View>
                      <View style={styles.rowBody}>
                        {isCreation ? (
                          <View style={styles.priceLine}>
                            <Text style={styles.newPrice}>{formatMoney(entry.newPrice)}</Text>
                            <View style={styles.createdBadge}>
                              <Text style={styles.createdBadgeText}>Original price</Text>
                            </View>
                          </View>
                        ) : (
                          <View style={styles.priceLine}>
                            <Text style={styles.oldPrice}>{formatMoney(oldNum)}</Text>
                            <Text style={styles.arrow}>→</Text>
                            <Text style={styles.newPrice}>{formatMoney(newNum)}</Text>
                            <View
                              style={[
                                styles.deltaBadge,
                                increased ? styles.deltaUp : styles.deltaDown,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.deltaText,
                                  increased ? styles.deltaTextUp : styles.deltaTextDown,
                                ]}
                              >
                                {increased ? '▲' : '▼'} {formatMoney(Math.abs(delta))}
                              </Text>
                            </View>
                          </View>
                        )}
                        <Text style={styles.date}>{formatDateTime(entry.changedAt)}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
  title: { fontSize: 19, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '600' },

  body: { marginTop: 16, marginBottom: 18 },
  scroll: { maxHeight: 320 },
  scrollContent: { paddingRight: 4 },

  stateWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28 },
  stateText: { marginTop: 8, color: '#6B7280', fontSize: 14, fontWeight: '500', textAlign: 'center' },
  errorText: { color: '#DC2626', fontSize: 14, fontWeight: '600', textAlign: 'center' },

  row: { flexDirection: 'row', paddingVertical: 8 },
  timelineCol: { width: 22, alignItems: 'center', paddingTop: 4 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
  },
  dotCreation: { backgroundColor: '#9CA3AF' },
  rowBody: { flex: 1, paddingLeft: 4 },
  priceLine: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  oldPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  arrow: { fontSize: 14, color: '#6B7280', fontWeight: '700' },
  newPrice: { fontSize: 16, fontWeight: '800', color: '#4F46E5' },
  date: { fontSize: 12, color: '#6B7280', marginTop: 3, fontWeight: '500' },

  createdBadge: {
    backgroundColor: '#EEF0FB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  createdBadgeText: { fontSize: 11, fontWeight: '700', color: '#6366F1' },

  deltaBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  deltaUp: { backgroundColor: '#FEF2F2' },
  deltaDown: { backgroundColor: '#ECFDF5' },
  deltaText: { fontSize: 11, fontWeight: '700' },
  deltaTextUp: { color: '#DC2626' },
  deltaTextDown: { color: '#059669' },

  closeButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  closeButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});

export default PriceHistoryModal;
