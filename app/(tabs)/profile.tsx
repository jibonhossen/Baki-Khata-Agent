import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import supabase, { Agent } from '../../lib/supabase';

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [agent, setAgent] = useState<Agent | null>(null);

    useEffect(() => {
        const currentAgent = supabase.getCurrentAgent();
        setAgent(currentAgent);
    }, []);

    const handleLogout = () => {
        Alert.alert(
            'লগআউট',
            'আপনি কি লগআউট করতে চান?',
            [
                { text: 'বাতিল', style: 'cancel' },
                {
                    text: 'লগআউট',
                    style: 'destructive',
                    onPress: async () => {
                        await supabase.logoutAgent();
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>প্রোফাইল</Text>
            </View>

            {/* Profile Card */}
            <LinearGradient
                colors={['#1E1E2D', '#252540']}
                style={styles.profileCard}
            >
                <View style={styles.avatarLarge}>
                    <Ionicons name="person" size={40} color={colors.primary.default} />
                </View>
                <Text style={styles.agentName}>{agent?.name || 'এজেন্ট'}</Text>
                <Text style={styles.agentPhone}>{agent?.phone || '-'}</Text>
                <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                        <Ionicons name="shield-checkmark" size={14} color={colors.success.default} />
                        <Text style={styles.badgeText}>সক্রিয় এজেন্ট</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>অ্যাকশন</Text>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIcon}>
                        <Ionicons name="stats-chart-outline" size={20} color={colors.primary.default} />
                    </View>
                    <View style={styles.menuInfo}>
                        <Text style={styles.menuLabel}>সংগ্রহের রিপোর্ট</Text>
                        <Text style={styles.menuSubtitle}>আপনার সংগ্রহের ইতিহাস দেখুন</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIcon}>
                        <Ionicons name="help-circle-outline" size={20} color={colors.primary.default} />
                    </View>
                    <View style={styles.menuInfo}>
                        <Text style={styles.menuLabel}>সাহায্য</Text>
                        <Text style={styles.menuSubtitle}>প্রশ্ন বা সমস্যা?</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
                </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <View style={styles.logoutSection}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.danger.default} />
                    <Text style={styles.logoutText}>লগআউট</Text>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>এজেন্ট অ্যাপ v1.0.0</Text>
            </View>
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
        paddingVertical: spacing.base,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    profileCard: {
        marginHorizontal: spacing.lg,
        padding: spacing.xl,
        borderRadius: borderRadius['2xl'],
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.default,
        ...shadows.md,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary.default + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    agentName: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    agentPhone: {
        fontSize: typography.fontSize.base,
        color: colors.text.muted,
        marginTop: spacing.xs,
    },
    badgeRow: {
        marginTop: spacing.md,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.success.default + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    badgeText: {
        fontSize: typography.fontSize.sm,
        color: colors.success.default,
        fontWeight: '500',
    },
    section: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
        color: colors.text.muted,
        marginBottom: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        padding: spacing.base,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary.default + '15',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    menuLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: '500',
        color: colors.text.primary,
    },
    menuSubtitle: {
        fontSize: typography.fontSize.sm,
        color: colors.text.muted,
        marginTop: 2,
    },
    logoutSection: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.danger.default + '15',
        padding: spacing.base,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.danger.default + '30',
    },
    logoutText: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.danger.default,
    },
    footer: {
        position: 'absolute',
        bottom: spacing['3xl'],
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    footerText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.muted,
    },
});
