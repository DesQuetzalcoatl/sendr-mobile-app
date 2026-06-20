import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#f5f5f7' }]}>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Notifications
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: colors.tint }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#444446' : '#e5e5ea' }]} />
            <TouchableOpacity style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Account Settings
              </Text>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#444446' : '#e5e5ea' }]} />
            <TouchableOpacity style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Help & Support
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colorScheme === 'dark' ? '#8e8e93' : '#999999' }]}>
            Version 1.0.0
          </Text>
        </View>
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});