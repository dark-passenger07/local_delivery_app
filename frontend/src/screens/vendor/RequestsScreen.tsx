import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking
} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context"
import { useRequestStore, CustomerRequest, Status } from '../../context/vendorContext/RequestContext';

const TABS = [
  { key: 'PENDING' as const, label: 'New', icon: '🕓' },
  { key: 'APPROVED' as const, label: 'Accepted', icon: '✅' },
  { key: 'REJECTED' as const, label: 'Rejected', icon: '✕' },
];

const RequestsScreen = () => {
  const { customerRequests, getCustomerRequests, updateRequest } = useRequestStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await getCustomerRequests();
    } catch (err: any) {
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [getCustomerRequests]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: string, targetStatus: Status) => {
    setUpdatingId(id);
    try {
      await updateRequest(id, targetStatus);
    } catch (err: any) {
      Alert.alert("Update Failed", err.message || "Something went wrong while processing.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Ask before accepting or rejecting so a mis-tap doesn't change a customer's request
  const confirmAction = (id: string, targetStatus: Status, customerName: string) => {
    const isAccepting = targetStatus === Status.ACCEPTED;
    Alert.alert(
      isAccepting ? "Accept This Request?" : "Reject This Request?",
      isAccepting
        ? `You will accept ${customerName}'s request.`
        : `You will reject ${customerName}'s request. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isAccepting ? "Yes, Accept" : "Yes, Reject",
          style: isAccepting ? "default" : "destructive",
          onPress: () => handleAction(id, targetStatus)
        }
      ]
    );
  };

  const callCustomer = (phone: string) => {
    const digits = (phone || "").replace(/\D/g, "");
    if (!digits) {
      Alert.alert("No Phone Number", "This customer hasn't shared a phone number.");
      return;
    }
    Linking.openURL(`tel:${digits}`).catch(() =>{
      Alert.alert("Can't Call Right Now", "Something went wrong. Please try again.");
    });
  };

  const categorizedRequests = useMemo(() => {
    return {
      PENDING: customerRequests.filter(req => req.status === 'PENDING'),
      APPROVED: customerRequests.filter(req => req.status === 'ACCEPTED'),
      REJECTED: customerRequests.filter(req => req.status === 'REJECTED'),
    };
  }, [customerRequests]);

  const currentData = categorizedRequests[activeTab];

  const renderRequestItem = ({ item }: { item: CustomerRequest }) => {
    const user = item.vendorCustomers.user;
    const isThisCardUpdating = updatingId === item.id;

    return (
      <View style={styles.card}>
        <View style={styles.userRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase() || "?"}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userAddress}>📍 {user.address}</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => callCustomer(user.phone)}
            activeOpacity={0.75}
          >
            <Text style={styles.callButtonIcon}>📞</Text>
          </TouchableOpacity>
        </View>

        {item.productName && (
          <View style={styles.productRow}>
            <Text style={styles.productLabel}>Product:</Text>
            <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">{item.productName}</Text>
          </View>
        )}

        <View style={styles.requestDetails}>
          <Text style={styles.typeBadge}>{item.type}</Text>
          {(item.type === 'INCREASE' || item.type === 'DECREASE') && item.requestedQuantity && (
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityBadgeText}>Requested Qty: {item.requestedQuantity}</Text>
            </View>
          )}
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>

          <View style={styles.dateContainer}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>Start</Text>
              <Text style={styles.dateText}>{new Date(item.start_date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>End</Text>
              <Text style={styles.dateText}>{new Date(item.end_date).toLocaleDateString()}</Text>
            </View>
          </View>

          {item.respondedAt && (
            <Text style={styles.respondedText}>
              Answered on {new Date(item.respondedAt).toLocaleDateString()}
            </Text>
          )}

          {item.status === 'PENDING' && (
            <View style={styles.actionRow}>
              {isThisCardUpdating ? (
                <ActivityIndicator size="small" color="#2563EB" style={styles.actionLoader} />
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButtonColor]}
                    onPress={() => confirmAction(item.id, Status.REJECTED, user.name)}
                    disabled={updatingId !== null}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButtonColor]}
                    onPress={() => confirmAction(item.id, Status.ACCEPTED, user.name)}
                    disabled={updatingId !== null}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  // Wrapped conditional states in SafeAreaView to maintain structural consistency
  if (loading && customerRequests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading requests…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && customerRequests.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRequests} activeOpacity={0.85}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Requests</Text>
      </View>

      {/* Tab Navigation Menu */}
       <View style={styles.tabBar}>
         {TABS.map((tab) => (
           <TouchableOpacity
             key={tab.key}
             style={[styles.tab, activeTab === tab.key && styles.activeTab]}
             onPress={() => setActiveTab(tab.key)}
             activeOpacity={0.8}
           >
             <Text style={styles.tabIcon}>{tab.icon}</Text>
             <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
               {tab.label}
             </Text>
             <View style={[styles.tabCount, activeTab === tab.key && styles.activeTabCount]}>
               <Text style={[styles.tabCountText, activeTab === tab.key && styles.activeTabCountText]}>
                 {categorizedRequests[tab.key].length}
               </Text>
             </View>
           </TouchableOpacity>
         ))}
       </View>

      {/* Requests Feed */}
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        renderItem={renderRequestItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchRequests}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No {activeTab === 'PENDING' ? 'new' : activeTab.toLowerCase()} requests right now.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default RequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 60,
  },
  loadingText: {
    marginTop: 12,
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  errorIcon: {
    fontSize: 34,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 18,
    fontWeight: '600',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 4,
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    gap: 3,
  },
  activeTab: {
    backgroundColor: '#DBEAFE',
  },
  tabIcon: {
    fontSize: 11,
  },
  tabLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
  },
  activeTabLabel: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  tabCount: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  activeTabCount: {
    backgroundColor: '#2563EB',
  },
  tabCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  activeTabCountText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEF1F8',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 14,
  },
   productRow: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: '#F8FAFC',
     borderRadius: 10,
     padding: 8,
     marginBottom: 10,
     flexWrap: 'wrap',
     gap: 6,
   },
   productLabel: {
     fontSize: 11,
     fontWeight: '700',
     color: '#64748B',
     textTransform: 'uppercase',
     letterSpacing: 0.3,
   },
   productName: {
     fontSize: 13,
     fontWeight: '700',
     color: '#0F172A',
     flex: 1,
   },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'capitalize',
  },
  userAddress: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  callButtonIcon: {
    fontSize: 17,
  },
  requestDetails: {
    marginTop: 2,
  },
   typeBadge: {
     alignSelf: 'flex-start',
     backgroundColor: '#DBEAFE',
     color: '#1D4ED8',
     fontSize: 11,
     fontWeight: '800',
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 8,
     overflow: 'hidden',
     marginBottom: 10,
   },
   quantityBadge: {
     alignSelf: 'flex-start',
     backgroundColor: '#FEF3C7',
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 8,
     marginBottom: 10,
   },
   quantityBadgeText: {
     color: '#92400E',
     fontSize: 11,
     fontWeight: '800',
   },
  messageBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  messageText: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 21,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  dateBlock: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  dateText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  respondedText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  acceptButtonColor: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  rejectButtonColor: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  acceptButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  rejectButtonText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 15,
  },
  actionLoader: {
    paddingVertical: 10,
    alignSelf: 'center',
  }
});