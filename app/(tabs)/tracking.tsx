import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// Sample shipment data
const shipments = [
  {
    id: '#dc3bcizk',
    amount: '₦1,040.56',
    pickup: '1. Coker Road, Illupeju Lagos',
    delivery: '10B, Rockstone Villa. Badore Ajah Lagos',
    status: 'pending',
  },
  {
    id: '#dc3bcizk',
    amount: '₦1,040.56',
    pickup: '1. Coker Road, Illupeju Lagos',
    delivery: '10B, Rockstone Villa. Badore Ajah Lagos',
    status: 'pending',
  },
  {
    id: '#dc3bcizk',
    amount: '₦1,040.56',
    pickup: '1. Coker Road, Illupeju Lagos',
    delivery: '10B, Rockstone Villa. Badore Ajah Lagos',
    status: 'pending',
  },
];

export default function TrackingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState('pending');

  const tabs = ['Pending', 'Completed', 'Canceled'];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending':
        return '#FFA500';
      case 'completed':
        return '#34C759';
      case 'canceled':
        return '#FF3B30';
      default:
        return '#FFA500';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Shipment</Text>
        </View>

        {/* Tab Bar */}
        <View style={[styles.tabContainer, { borderBottomColor: colorScheme === 'dark' ? '#444446' : '#e5e5ea' }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab.toLowerCase() && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.toLowerCase())}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab.toLowerCase() 
                      ? colors.tint 
                      : colorScheme === 'dark' ? '#8e8e93' : '#999999',
                  },
                ]}
              >
                {tab}
              </Text>
              {activeTab === tab.toLowerCase() && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.tint }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Shipment Cards */}
        {shipments.map((shipment, index) => (
          <View key={index} style={[styles.shipmentCard, { backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f5f5f7' }]}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={[styles.orderLabel, { color: colorScheme === 'dark' ? '#8e8e93' : '#999999' }]}>
                  Order ID
                </Text>
                <Text style={[styles.orderId, { color: colors.text }]}>
                  {shipment.id}
                </Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={[styles.amountLabel, { color: colorScheme === 'dark' ? '#8e8e93' : '#999999' }]}>
                  Amount
                </Text>
                <Text style={[styles.amount, { color: colors.text }]}>
                  {shipment.amount}
                </Text>
              </View>
            </View>

            <View style={styles.addressContainer}>
              <View style={styles.addressRow}>
                <View style={[styles.dot, { backgroundColor: colors.tint }]} />
                <View>
                  <Text style={[styles.addressLabel, { color: colorScheme === 'dark' ? '#8e8e93' : '#999999' }]}>
                    Pickup address
                  </Text>
                  <Text style={[styles.addressText, { color: colors.text }]}>
                    {shipment.pickup}
                  </Text>
                </View>
              </View>
              <View style={styles.addressRow}>
                <View style={[styles.dot, { backgroundColor: '#34C759' }]} />
                <View>
                  <Text style={[styles.addressLabel, { color: colorScheme === 'dark' ? '#8e8e93' : '#999999' }]}>
                    Delivery address
                  </Text>
                  <Text style={[styles.addressText, { color: colors.text }]}>
                    {shipment.delivery}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(shipment.status) }]}>
              <Text style={styles.statusText}>
                {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {
    // Active styles handled by text color and indicator
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '60%',
    borderRadius: 1,
  },
  shipmentCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressContainer: {
    marginTop: 4,
  },
  addressRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    marginRight: 10,
  },
  addressLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});