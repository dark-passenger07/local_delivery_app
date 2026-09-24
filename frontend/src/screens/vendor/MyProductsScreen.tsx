import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { useProductStore } from '../../context/vendorContext/ProductContext'
import PriceHistoryModal, { ProductPriceHistoryEntry } from '../../components/PriceHistoryModal'

// ---------------------------------------------------------------------------
// Design tokens — 8dp spacing scale + a small, consistent color palette.
// Centralizing these makes the screen easy to re-theme later.
// ---------------------------------------------------------------------------
const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40 }

const COLORS = {
  background: '#FFFFFF',
  surface: '#FAFAF8',
  surfaceAlt: '#F1EFE8',
  border: '#EDEBE3',
  primary: '#2F6FED',
  primarySurface: '#E6F1FB',
  primaryText: '#0C447C',
  danger: '#A32D2D',
  dangerSurface: '#FCEBEB',
  textPrimary: '#1A1A18',
  textSecondary: '#5F5E5A',
  textTertiary: '#9A9990',
  overlay: 'rgba(20, 20, 18, 0.55)',
  white: '#FFFFFF',
}

const RADIUS = { sm: 10, md: 16, lg: 20, pill: 999 }

const PRODUCT_COLORS = [
  { bg: '#E1F5EE', text: '#085041' },
  { bg: '#FAECE7', text: '#712B13' },
  { bg: '#E6F1FB', text: '#0C447C' },
  { bg: '#FBEAF0', text: '#72243E' },
  { bg: '#FAEEDA', text: '#633806' },
]

const getProductColor = (id: string) => {
  const sum = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return PRODUCT_COLORS[sum % PRODUCT_COLORS.length]
}

const ProductCard = ({ item, onEdit, onDelete, onHistory }: any) => {
  const color = getProductColor(item.id)
  const priceValue = Number(item.price) || 0
  const unitLabel = String(item.unit || 'unit').toLowerCase()

  return (
    <View style={styles.productCard}>
      <View style={[styles.productIcon, { backgroundColor: color.bg }]}>
        <Feather name="package" size={20} color={color.text} />
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>
          {item.productName}
        </Text>
        <Text style={styles.productDesc} numberOfLines={2}>
          {item.description}
        </Text>
        {priceValue > 0 ? (
          <TouchableOpacity
            style={styles.pricePill}
            onPress={() => onHistory(item)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`View price history of ${item.productName}`}
          >
            <Text style={styles.pricePillText}>₹{priceValue.toFixed(2)}</Text>
            <Text style={styles.pricePillUnit}> / {unitLabel}</Text>
            <Feather name="clock" size={12} color={COLORS.primaryText} style={styles.pricePillIcon} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.pricePill, styles.pricePillEmpty]}>
            <Feather name="alert-circle" size={12} color={COLORS.danger} />
            <Text style={styles.pricePillEmptyText}>No price set — tap edit</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Edit price of ${item.productName}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.editButton}
          onPress={() => onEdit(item)}
        >
          <Feather name="edit-2" size={16} color={COLORS.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.productName}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
        >
          <Feather name="trash-2" size={17} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export const MyProductsScreen = () => {
  const { allProducts, getAllProducts, addProduct, updateProduct, removeProduct, getProductPriceHistory } = useProductStore()
  const insets = useSafeAreaInsets()

  // Component Local States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [unit, setUnit] = useState('PIECE')
  const [price, setPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Edit-price modal state (kept separate from the add flow).
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Price-history modal state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyProduct, setHistoryProduct] = useState<{ productName: string; unit: string } | null>(null)
  const [historyEntries, setHistoryEntries] = useState<ProductPriceHistoryEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  // Pull-to-refresh state, tracked separately from the first load
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Initial load state + error state, so the screen can show a proper
  // loading spinner and a retry-able error banner instead of a blank list.
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    setLoadError(null)
    try {
      await getAllProducts()
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to load your products.')
    }
  }, [getAllProducts])

  // Initial data pull on component mount
  useEffect(() => {
    let mounted = true
      ; (async () => {
        await loadProducts()
        if (mounted) setIsInitialLoading(false)
      })()
    return () => {
      mounted = false
    }
  }, [loadProducts])

  // Callback function triggered during down-scroll pull gesture
  const handleOnRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await loadProducts()
    setIsRefreshing(false)
  }, [loadProducts])

  // Cache rendering matrix computations
  const memoizedProducts = useMemo(() => allProducts, [allProducts])

  const handleAddProduct = async () => {
    if (!productName.trim() || !description.trim()) {
      setErrorMessage('Please fill out all fields.')
      return
    }

    const parsedPrice = Number(price)
    if (!price.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Please enter a price greater than 0.')
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      await addProduct({ productName, description, unit, price: String(parsedPrice) })
      setProductName('')
      setDescription('')
      setUnit('PIECE')
      setPrice('')
      setIsModalOpen(false)
    } catch (error: any) {
      setErrorMessage(error.message || 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditModal = useCallback((item: any) => {
    setEditingProduct(item)
    const current = Number(item?.price) || 0
    setEditPrice(current > 0 ? String(current) : '')
    setEditError(null)
    setIsEditOpen(true)
  }, [])

  const closeEditModal = () => {
    if (isEditing) return
    setIsEditOpen(false)
    setEditingProduct(null)
    setEditPrice('')
    setEditError(null)
  }

  const handleUpdatePrice = async () => {
    if (!editingProduct) return

    const parsedPrice = Number(editPrice)
    if (!editPrice.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setEditError('Please enter a price greater than 0.')
      return
    }

    setEditError(null)
    setIsEditing(true)
    try {
      await updateProduct(editingProduct.id, String(parsedPrice))
      setIsEditOpen(false)
      setEditingProduct(null)
      setEditPrice('')
    } catch (error: any) {
      setEditError(error.message || 'Could not update the price.')
    } finally {
      setIsEditing(false)
    }
  }

  const openPriceHistory = useCallback(
    async (item: any) => {
      setHistoryProduct({ productName: item.productName, unit: String(item.unit || 'unit') })
      setHistoryEntries([])
      setHistoryError(null)
      setHistoryLoading(true)
      setIsHistoryOpen(true)
      try {
        const entries = await getProductPriceHistory(item.id)
        setHistoryEntries(entries)
      } catch (error: any) {
        setHistoryError(error?.message || 'Failed to load price history.')
      } finally {
        setHistoryLoading(false)
      }
    },
    [getProductPriceHistory]
  )

  const closePriceHistory = () => {
    setIsHistoryOpen(false)
    setHistoryProduct(null)
    setHistoryEntries([])
    setHistoryError(null)
  }

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        'Delete product',
        'Are you sure you want to delete this product? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => removeProduct(id),
          },
        ]
      )
    },
    [removeProduct]
  )

  // Reserve room at the bottom of the list so the FAB never sits on top of
  // the last card, and respect the device's safe-area inset.
  const fabBottomOffset = insets.bottom + SPACING.lg
  const listBottomPadding = fabBottomOffset + 56 /* fab size */ + SPACING.lg

  const renderContent = () => {
    if (isInitialLoading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.centerStateText}>Loading your products…</Text>
        </View>
      )
    }

    if (loadError && memoizedProducts.length === 0) {
      return (
        <View style={styles.centerState}>
          <View style={styles.errorIconCircle}>
            <Feather name="alert-circle" size={24} color={COLORS.danger} />
          </View>
          <Text style={styles.centerStateTitle}>Couldn't load products</Text>
          <Text style={styles.centerStateText}>{loadError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <FlatList
        data={memoizedProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: listBottomPadding },
          memoizedProducts.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.centerState}>
            <View style={styles.emptyIconCircle}>
              <Feather name="inbox" size={26} color={COLORS.primary} />
            </View>
            <Text style={styles.centerStateTitle}>No products yet</Text>
            <Text style={styles.centerStateText}>
              Tap the button below to add your first product.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleOnRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        renderItem={({ item }) => (
          <ProductCard item={item} onEdit={openEditModal} onDelete={handleDelete} onHistory={openPriceHistory} />
        )}
      />
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.md }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My products</Text>
        {memoizedProducts.length > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{memoizedProducts.length}</Text>
          </View>
        )}
      </View>

      {renderContent()}

      {/* Floating Action Button — anchored above safe area, clear of the list */}
      <View style={[styles.fabWrapper, { bottom: fabBottomOffset }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Add new product"
          style={styles.floatingButton}
          onPress={() => {
            setErrorMessage(null)
            setIsModalOpen(true)
          }}
        >
          <Feather name="plus" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Add Product Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { paddingBottom: insets.bottom + SPACING.md }]}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Add new product</Text>
                <Text style={styles.modalSubtitle}>
                  Fill in the details below to add it to your catalog.
                </Text>

                {errorMessage && (
                  <View style={styles.errorBanner}>
                    <Feather name="alert-circle" size={15} color={COLORS.danger} />
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Product name</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. milk, water, newspaper..."
                  placeholderTextColor={COLORS.textTertiary}
                  value={productName}
                  onChangeText={setProductName}
                  editable={!isSubmitting}
                />

                 <Text style={styles.inputLabel}>Description</Text>
                 <TextInput
                   style={[styles.inputField, styles.inputMultiline]}
                   placeholder="Briefly describe the product"
                   placeholderTextColor={COLORS.textTertiary}
                   value={description}
                   onChangeText={setDescription}
                   multiline
                   textAlignVertical="top"
                   editable={!isSubmitting}
                 />

                 <Text style={styles.inputLabel}>Unit</Text>
                 <View style={styles.unitRow}>
                   {['PIECE', 'PACKET', 'BOTTLE', 'LITRE', 'ML', 'KG', 'GRAM', 'DOZEN'].map((u) => {
                     const selected = unit === u
                     return (
                       <TouchableOpacity
                         key={u}
                         style={[styles.unitChip, selected && styles.unitChipSelected]}
                         onPress={() => setUnit(u)}
                         activeOpacity={0.8}
                       >
                         <Text style={[styles.unitChipText, selected && styles.unitChipTextSelected]}>
                           {u}
                         </Text>
                       </TouchableOpacity>
                     )
                   })}
                 </View>

                 <Text style={styles.inputLabel}>Price per {unit.toLowerCase()} (₹)</Text>
                 <TextInput
                   style={styles.inputField}
                   placeholder="e.g. 30"
                   placeholderTextColor={COLORS.textTertiary}
                   value={price}
                   onChangeText={setPrice}
                   keyboardType="decimal-pad"
                   editable={!isSubmitting}
                 />

                 <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                    onPress={handleAddProduct}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <Text style={styles.submitBtnText}>Add product</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Price Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={isEditOpen}
        onRequestClose={closeEditModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { paddingBottom: insets.bottom + SPACING.md }]}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Edit price</Text>
                <Text style={styles.modalSubtitle}>
                  {editingProduct
                    ? `Update the price for ${editingProduct.productName}. This only affects new subscriptions — existing customers keep their current price.`
                    : 'Update the price for this product.'}
                </Text>

                {editError && (
                  <View style={styles.errorBanner}>
                    <Feather name="alert-circle" size={15} color={COLORS.danger} />
                    <Text style={styles.errorText}>{editError}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>
                  Price per {String(editingProduct?.unit || 'unit').toLowerCase()} (₹)
                </Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. 30"
                  placeholderTextColor={COLORS.textTertiary}
                  value={editPrice}
                  onChangeText={setEditPrice}
                  keyboardType="decimal-pad"
                  editable={!isEditing}
                  autoFocus
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={closeEditModal}
                    disabled={isEditing}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.submitBtn, isEditing && styles.submitBtnDisabled]}
                    onPress={handleUpdatePrice}
                    disabled={isEditing}
                  >
                    {isEditing ? (
                      <ActivityIndicator color={COLORS.white} size="small" />
                    ) : (
                      <Text style={styles.submitBtnText}>Save price</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <PriceHistoryModal
        visible={isHistoryOpen}
        onClose={closePriceHistory}
        productName={historyProduct?.productName}
        unit={historyProduct?.unit}
        entries={historyEntries}
        loading={historyLoading}
        error={historyError}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  headerBadge: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  headerBadgeText: {
    color: COLORS.primaryText,
    fontWeight: '700',
    fontSize: 14,
  },

  // List
  listContent: {
    paddingTop: SPACING.xs,
  },
  listContentEmpty: {
    flexGrow: 1,
  },

  // Center states (loading / empty / error)
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  centerStateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  centerStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconCircle: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.dangerSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },

  // Product card
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm + 4,
  },
  productInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  productDesc: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primarySurface,
  },
  pricePillText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primaryText,
  },
  pricePillUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryText,
    opacity: 0.75,
  },
  pricePillIcon: {
    marginLeft: 6,
    opacity: 0.85,
  },
  pricePillEmpty: {
    backgroundColor: COLORS.dangerSurface,
    gap: 5,
  },
  pricePillEmptyText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.danger,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.dangerSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // FAB
  fabWrapper: {
    position: 'absolute',
    right: SPACING.lg,
  },
  floatingButton: {
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    width: '100%',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.dangerSurface,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13.5,
    fontWeight: '500',
    flexShrink: 1,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginLeft: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  inputField: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    marginBottom: SPACING.md,
    fontSize: 15.5,
    color: COLORS.textPrimary,
    minHeight: 48,
  },
  inputMultiline: {
    height: 90,
    paddingTop: 12,
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  unitChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unitChipSelected: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primary,
  },
  unitChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  unitChipTextSelected: {
    color: COLORS.primaryText,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    minWidth: 96,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.surfaceAlt,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14.5,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14.5,
  },
})