import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, formatCurrency } from '../../constants/theme';
import supabase, { UserSubscription } from '../../lib/supabase';

export default function UsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserSubscription[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const data = await supabase.getUserSubscriptions();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (search.trim()) {
      const filtered = users.filter(
        u =>
          u.email?.toLowerCase().includes(search.toLowerCase()) ||
          u.user_name?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [search, users]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  }, [loadUsers]);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return colors.success.default;
      case 'expired':
      case 'grace_period':
        return colors.warning.default;
      case 'blocked':
        return colors.danger.default;
      default:
        return colors.text.muted;
    }
  };

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'সক্রিয়';
      case 'expired':
        return 'মেয়াদ শেষ';
      case 'grace_period':
        return 'গ্রেস পিরিয়ড';
      case 'blocked':
        return 'ব্লক';
      default:
        return 'নেই';
    }
  };

  const getDaysInfo = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const renderUser = ({ item }: { item: UserSubscription }) => {
    const days = getDaysInfo(item.expires_at);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => router.push(`/user/${item.user_id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.user_name || item.email || '?')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.user_name || 'Unknown'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        </View>

        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
          {days !== null && (
            <Text style={[styles.daysText, { color: days < 0 ? colors.danger.default : colors.text.muted }]}>
              {days > 0 ? `${days} দিন বাকি` : `${Math.abs(days)} দিন আগে শেষ`}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>গ্রাহক তালিকা</Text>
        <Text style={styles.subtitle}>{users.length} জন গ্রাহক</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
          placeholderTextColor={colors.text.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: colors.success.default }]}>
          <Text style={styles.statValue}>
            {users.filter(u => u.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>সক্রিয়</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.warning.default }]}>
          <Text style={styles.statValue}>
            {users.filter(u => u.status === 'expired' || u.status === 'grace_period').length}
          </Text>
          <Text style={styles.statLabel}>মেয়াদ শেষ</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.text.muted }]}>
          <Text style={styles.statValue}>
            {users.filter(u => !u.status).length}
          </Text>
          <Text style={styles.statLabel}>নতুন</Text>
        </View>
      </View>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.user_id}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.default}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyText}>কোনো গ্রাহক পাওয়া যায়নি</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.fontSize.base,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 3,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.default + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary.default,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
    marginTop: 2,
  },
  statusSection: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  daysText: {
    fontSize: typography.fontSize.xs,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.muted,
  },
});
