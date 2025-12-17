import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';
import supabase from '../lib/supabase';

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [phone, setPhone] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!phone.trim()) {
            Alert.alert('ত্রুটি', 'ফোন নম্বর লিখুন');
            return;
        }
        if (!pin.trim() || pin.length < 4) {
            Alert.alert('ত্রুটি', '৪ সংখ্যার পিন লিখুন');
            return;
        }

        setLoading(true);
        try {
            const agent = await supabase.loginAgent(phone, pin);
            if (agent) {
                router.replace('/(tabs)');
            } else {
                Alert.alert('ত্রুটি', 'ভুল ফোন নম্বর বা পিন');
            }
        } catch (error) {
            Alert.alert('ত্রুটি', 'লগইন ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={['#0A0A0F', '#151520', '#0A0A0F']}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.content}
            >
                {/* Logo */}
                <View style={styles.logoSection}>
                    <LinearGradient
                        colors={colors.primary.gradient}
                        style={styles.logoContainer}
                    >
                        <Ionicons name="people" size={40} color={colors.text.primary} />
                    </LinearGradient>
                    <Text style={styles.appName}>এজেন্ট অ্যাপ</Text>
                    <Text style={styles.tagline}>বাকির খাতা সংগ্রাহক</Text>
                </View>

                {/* Form */}
                <View style={styles.formSection}>
                    <Text style={styles.formTitle}>এজেন্ট লগইন</Text>

                    {/* Phone Input */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputIcon}>
                            <Ionicons name="call-outline" size={20} color={colors.text.muted} />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="ফোন নম্বর"
                            placeholderTextColor={colors.text.placeholder}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            autoComplete="tel"
                        />
                    </View>

                    {/* PIN Input */}
                    <View style={styles.inputContainer}>
                        <View style={styles.inputIcon}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.text.muted} />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="৪ সংখ্যার পিন"
                            placeholderTextColor={colors.text.placeholder}
                            value={pin}
                            onChangeText={setPin}
                            keyboardType="number-pad"
                            secureTextEntry
                            maxLength={6}
                        />
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={colors.primary.gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginButtonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.text.primary} />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>লগইন</Text>
                                    <Ionicons name="arrow-forward" size={20} color={colors.text.primary} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.text.muted} />
                    <Text style={styles.footerText}>শুধুমাত্র অনুমোদিত এজেন্টদের জন্য</Text>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        justifyContent: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: spacing['3xl'],
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.lg,
    },
    appName: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: 'bold',
        color: colors.text.primary,
        marginTop: spacing.lg,
    },
    tagline: {
        fontSize: typography.fontSize.base,
        color: colors.text.secondary,
        marginTop: spacing.xs,
    },
    formSection: {
        gap: spacing.md,
    },
    formTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    inputIcon: {
        paddingLeft: spacing.base,
    },
    input: {
        flex: 1,
        color: colors.text.primary,
        fontSize: typography.fontSize.base,
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.md,
    },
    loginButton: {
        marginTop: spacing.md,
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        ...shadows.md,
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.base,
    },
    loginButtonText: {
        color: colors.text.primary,
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        marginTop: spacing['3xl'],
    },
    footerText: {
        color: colors.text.muted,
        fontSize: typography.fontSize.sm,
    },
});
