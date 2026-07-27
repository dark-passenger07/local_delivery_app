import React from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Platform } from 'react-native';
import { Home, ShoppingBag, BellRing, User, ClipboardList } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from "../screens/customer/HomeScreen";
import RequestsScreen from "../screens/customer/RequestsScreen";
import ProfileScreen from "../screens/customer/ProfileScreen";
import { VendorScreen } from '../screens/customer/VendorScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MySubscriptionsScreen from '../screens/customer/MySubscriptionsScreen';
import SubscriptionCalendarScreen from '../screens/customer/SubscriptionCalendarScreen';
import ProductScreen from '../screens/customer/ProductScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator()

function SubscriptionsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MySubscriptions" component={MySubscriptionsScreen} />
      <Stack.Screen name="SubscriptionCalendar" component={SubscriptionCalendarScreen} />
    </Stack.Navigator>
  )
}

function VendorsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VendorScreen" component={VendorScreen} />
      <Stack.Screen name="ProductScreen" component={ProductScreen} />
    </Stack.Navigator>
  )
}

export default function CustomerTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: Platform.OS === 'ios' ? 92 : 72 + insets.bottom,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10 + insets.bottom,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? -6 : -4,
          marginBottom: Platform.OS === 'ios' ? 2 : 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: Platform.OS === 'ios' ? 2 : 0,
          marginBottom: Platform.OS === 'ios' ? 4 : 2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = focused ? size + 2 : size;

          switch (route.name) {
            case 'Home':
              return <Home color={color} size={iconSize} />;
            case 'Vendor':
              return <ShoppingBag color={color} size={iconSize} />;
            case 'Requests':
              return <BellRing color={color} size={iconSize} />;
            case 'Subscriptions':
              return <ClipboardList color={color} size={iconSize} />;
            case 'Profile':
              return <User color={color} size={iconSize} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Vendor" component={VendorsStack} />
      <Tab.Screen name="Requests" component={RequestsScreen} />
      <Tab.Screen name="Subscriptions" component={SubscriptionsStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}