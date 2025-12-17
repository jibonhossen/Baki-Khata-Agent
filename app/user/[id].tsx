import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows, formatCurrency } from '../../constants/theme';
import supabase, { UserSubscription, SubscriptionPlan, SubscriptionPayment } from '../../lib/supabase';

export default function UserDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [user, setUser] = useState<UserSubscription | null>(null);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [payments, setPayments] = useState<SubscriptionPayment[]>([]);

    const loadData = useCallback(async () => {
        try {
            const [users, availablePlans, paymentHistory] = await Promise.all([
                supabase.getUserSubscriptions(),
                supabase.getPlans(),
                supabase.getPaymentHistory(id!),
            ]);
            const found = users.find(u => u.user_id === id);
            setUser(found || null);
            setPlans(availablePlans);
            setPayments(paymentHistory);
            if (availablePlans.length > 0) {
                setSelectedPlan(availablePlans[0]);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

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
                return 'সাবস্ক্রিপশন নেই';
        }
    };

    const formatDate = (dateStr: string | null): string => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('bn-BD', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const handleExtendSubscription = async () => {
        if (!selectedPlan) {
            Alert.alert('ত্রুটি', 'একটি প্ল্যান নির্বাচন করুন');
            return;
        }

        Alert.alert(
            'পেমেন্ট নিশ্চিত করুন',
            `${selectedPlan.name_bn || selectedPlan.name} - ${formatCurrency(selectedPlan.price)} সংগ্রহ করা হয়েছে?`,
            [
                { text: 'বাতিল', style: 'cancel' },
                {
                    text: 'নিশ্চিত',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            const success = await supabase.extendSubscription(
                                id!,
                                selectedPlan.price,
                                selectedPlan.duration_days
                            );
                            if (success) {
                                setShowSuccess(true);
                                await loadData();
                                setTimeout(() => {
                                    setShowSuccess(false);
                                }, 2000);
                            } else {
                                Alert.alert('ত্রুটি', 'পেমেন্ট রেকর্ড করা যায়নি');
                            }
                        } catch (error) {
                            Alert.alert('ত্রুটি', 'সার্ভার ত্রুটি');
                        } finally {
                            setSubmitting(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={colors.primary.default} />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Ionicons name="alert-circle" size={48} color={colors.text.muted} />
                <Text style={styles.errorText}>গ্রাহক পাওয়া যায়নি</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backLink}>ফিরে যান</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statusColor = getStatusColor(user.status);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Success Overlay */}
            {showSuccess && (
                <View style={styles.successOverlay}>
                    <View style={styles.successBox}>
                        <Ionicons name="checkmark-circle" size={64} color={colors.success.default} />
                        <Text style={styles.successText}>পেমেন্ট সফল!</Text>
                        <Text style={styles.successSubtext}>
                            {selectedPlan?.duration_days} দিন যোগ হয়েছে
                        </Text>
                    </View>
                </View>
            )}

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>গ্রাহক বিবরণ</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* User Card */}
                <LinearGradient
                    colors={['#1E1E2D', '#252540']}
                    style={styles.userCard}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {(user.user_name || user.email || '?')[0].toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{user.user_name || 'Unknown'}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>

                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {getStatusLabel(user.status)}
                        </Text>
                    </View>

                    {user.expires_at && (
                        <Text style={styles.expiryText}>
                            মেয়াদ: {formatDate(user.expires_at)}
                        </Text>
                    )}
                </LinearGradient>

                {/* Plan Selection */}
                <View style={styles.planSection}>
                    <Text style={styles.sectionTitle}>প্ল্যান নির্বাচন করুন</Text>

                    {plans.map((plan) => (
                        <TouchableOpacity
                            key={plan.id}
                            style={[
                                styles.planCard,
                                selectedPlan?.id === plan.id && styles.planCardSelected
                            ]}
                            onPress={() => setSelectedPlan(plan)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.planRadio}>
                                <View style={[
                                    styles.radioOuter,
                                    selectedPlan?.id === plan.id && styles.radioOuterActive
                                ]}>
                                    {selectedPlan?.id === plan.id && (
                                        <View style={styles.radioInner} />
                                    )}
                                </View>
                            </View>

                            <View style={styles.planInfo}>
                                <Text style={styles.planName}>
                                    {plan.name_bn || plan.name}
                                </Text>
                                <Text style={styles.planDuration}>
                                    {plan.duration_days} দিন
                                </Text>
                                {plan.description && (
                                    <Text style={styles.planDescription}>{plan.description}</Text>
                                )}
                            </View>

                            <View style={styles.planPrice}>
                                <Text style={styles.priceAmount}>{formatCurrency(plan.price)}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleExtendSubscription}
                    disabled={submitting || !selectedPlan}
                >
                    <LinearGradient
                        colors={colors.primary.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitButtonGradient}
                    >
                        {submitting ? (
                            <ActivityIndicator color={colors.text.primary} />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color={colors.text.primary} />
                                <Text style={styles.submitButtonText}>
                                    পেমেন্ট নিশ্চিত করুন ({selectedPlan ? formatCurrency(selectedPlan.price) : ''})
                                </Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Payment History */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>পেমেন্ট ইতিহাস</Text>
                    {payments.length > 0 ? (
                        payments.map((payment) => (
                            <View key={payment.id} style={styles.paymentCard}>
                                <View style={styles.paymentIcon}>
                                    <Ionicons name="checkmark-circle" size={24} color={colors.success.default} />
                                </View>
                                <View style={styles.paymentInfo}>
                                    <Text style={styles.paymentAmount}>
                                        {formatCurrency(payment.amount)}
                                    </Text>
                                    <Text style={styles.paymentDate}>
                                        {formatDate(payment.payment_date)}
                                    </Text>
                                    {payment.collected_by_name && (
                                        <Text style={styles.paymentCollector}>
                                            সংগ্রহকারী: {payment.collected_by_name}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.paymentMethod}>
                                    <Text style={styles.methodText}>
                                        {payment.payment_method || 'Cash'}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyHistory}>
                            <Ionicons name="receipt-outline" size={40} color={colors.text.muted} />
                            <Text style={styles.emptyText}>কোন পেমেন্ট ইতিহাস নেই</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    errorText: {
        fontSize: typography.fontSize.base,
        color: colors.text.muted,
    },
    backLink: {
        fontSize: typography.fontSize.base,
        color: colors.primary.default,
        marginTop: spacing.md,
    },
    successOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    successBox: {
        backgroundColor: colors.background.card,
        padding: spacing['2xl'],
        borderRadius: borderRadius['2xl'],
        alignItems: 'center',
        gap: spacing.sm,
    },
    successText: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.success.default,
    },
    successSubtext: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.base,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing['3xl'],
    },
    userCard: {
        padding: spacing.xl,
        borderRadius: borderRadius['2xl'],
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.default,
        marginBottom: spacing.xl,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary.default + '30',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: 'bold',
        color: colors.primary.default,
    },
    userName: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    userEmail: {
        fontSize: typography.fontSize.base,
        color: colors.text.muted,
        marginTop: spacing.xs,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
        marginTop: spacing.md,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: typography.fontSize.sm,
        fontWeight: '600',
    },
    expiryText: {
        fontSize: typography.fontSize.sm,
        color: colors.text.muted,
        marginTop: spacing.sm,
    },
    planSection: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
    planCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        padding: spacing.base,
        borderRadius: borderRadius.xl,
        marginBottom: spacing.sm,
        borderWidth: 2,
        borderColor: colors.border.default,
    },
    planCardSelected: {
        borderColor: colors.primary.default,
        backgroundColor: colors.primary.default + '10',
    },
    planRadio: {
        marginRight: spacing.md,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border.light,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterActive: {
        borderColor: colors.primary.default,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary.default,
    },
    planInfo: {
        flex: 1,
    },
    planName: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
    },
    planDuration: {
        fontSize: typography.fontSize.sm,
        color: colors.text.muted,
        marginTop: 2,
    },
    planDescription: {
        fontSize: typography.fontSize.xs,
        color: colors.success.default,
        marginTop: 4,
    },
    planPrice: {
        alignItems: 'flex-end',
    },
    priceAmount: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: colors.primary.default,
    },
    submitButton: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        ...shadows.md,
    },
    submitButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.base,
    },
    submitButtonText: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        color: colors.text.primary,
    },
    historySection: {
        marginTop: spacing.xl,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.card,
        padding: spacing.base,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    paymentIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.success.default + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentInfo: {
        flex: 1,
    },
    paymentAmount: {
        fontSize: typography.fontSize.base,
        fontWeight: '600',
        color: colors.text.primary,
    },
    paymentDate: {
        fontSize: typography.fontSize.sm,
        color: colors.text.muted,
        marginTop: 2,
    },
    paymentCollector: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        marginTop: 2,
    },
    paymentMethod: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: colors.background.tertiary,
        borderRadius: borderRadius.sm,
    },
    methodText: {
        fontSize: typography.fontSize.xs,
        color: colors.text.secondary,
        textTransform: 'capitalize',
    },
    emptyHistory: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.md,
        backgroundColor: colors.background.card,
        borderRadius: borderRadius.lg,
    },
    emptyText: {
        fontSize: typography.fontSize.base,
        color: colors.text.muted,
    },
});
