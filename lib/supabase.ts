import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the same Supabase project as main app
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Agent storage key
const AGENT_STORAGE_KEY = 'agent_session';

export interface Agent {
    id: string;
    name: string;
    phone: string;
    is_active: boolean;
}

export interface UserSubscription {
    user_id: string;
    email: string;
    user_name: string | null;
    subscription_id: string | null;
    status: string | null;
    starts_at: string | null;
    expires_at: string | null;
    grace_period_ends_at: string | null;
    plan_name: string | null;
    plan_price: number | null;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    name_bn: string | null;
    price: number;
    duration_days: number;
    description: string | null;
    is_active: boolean;
}

export interface SubscriptionPayment {
    id: string;
    subscription_id: string | null;
    user_id: string;
    amount: number;
    payment_method: string | null;
    collected_by_name: string | null;
    collected_by_phone: string | null;
    payment_date: string | null;
    notes: string | null;
    created_at: string | null;
}

class SupabaseService {
    client: SupabaseClient;
    private currentAgent: Agent | null = null;

    private listeners: ((agent: Agent | null) => void)[] = [];

    constructor() {
        this.client = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                storage: AsyncStorage,
            },
        });
    }

    // Subscribe to auth state changes
    onAuthStateChange(callback: (agent: Agent | null) => void) {
        this.listeners.push(callback);
        // Immediately notify with current state
        callback(this.currentAgent);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    private notifyListeners() {
        this.listeners.forEach(cb => cb(this.currentAgent));
    }

    // Agent login with phone + PIN
    async loginAgent(phone: string, pin: string): Promise<Agent | null> {
        try {
            const { data, error } = await this.client.rpc('verify_agent_pin', {
                agent_phone: phone,
                agent_pin: pin,
            });

            if (error) {
                console.error('Agent login error:', error);
                return null;
            }

            if (data && data.length > 0) {
                const agent = data[0] as Agent;
                this.currentAgent = agent;
                await AsyncStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agent));
                this.notifyListeners();
                return agent;
            }

            return null;
        } catch (error) {
            console.error('Agent login exception:', error);
            return null;
        }
    }

    // Check if agent is logged in
    async getStoredAgent(): Promise<Agent | null> {
        try {
            const stored = await AsyncStorage.getItem(AGENT_STORAGE_KEY);
            if (stored) {
                this.currentAgent = JSON.parse(stored);
                return this.currentAgent;
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    // Logout agent
    async logoutAgent(): Promise<void> {
        this.currentAgent = null;
        await AsyncStorage.removeItem(AGENT_STORAGE_KEY);
        this.notifyListeners();
    }

    // Get current agent
    getCurrentAgent(): Agent | null {
        return this.currentAgent;
    }

    // Fetch all users with their subscription status
    async getUserSubscriptions(): Promise<UserSubscription[]> {
        try {
            const { data, error } = await this.client
                .from('user_subscriptions_view')
                .select('*');

            if (error) {
                console.error('Error fetching users:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Exception fetching users:', error);
            return [];
        }
    }

    // Fetch available subscription plans (excluding free trial)
    async getPlans(): Promise<SubscriptionPlan[]> {
        try {
            const { data, error } = await this.client
                .from('subscription_plans')
                .select('*')
                .eq('is_active', true)
                .neq('name', 'Free Trial') // Hide free trial from agent app
                .order('duration_days', { ascending: true });

            if (error) {
                console.error('Error fetching plans:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Exception fetching plans:', error);
            return [];
        }
    }

    // Extend subscription for a user
    async extendSubscription(
        userId: string,
        amount: number,
        daysToExtend: number = 30
    ): Promise<boolean> {
        if (!this.currentAgent) {
            console.error('No agent logged in');
            return false;
        }

        try {
            const { data, error } = await this.client.rpc('extend_subscription', {
                target_user_id: userId,
                payment_amount: amount,
                agent_id_param: this.currentAgent.id,
                days_to_extend: daysToExtend,
            });

            if (error) {
                console.error('Error extending subscription:', error);
                return false;
            }

            return data === true;
        } catch (error) {
            console.error('Exception extending subscription:', error);
            return false;
        }
    }

    // Fetch subscription payment history for a user
    async getPaymentHistory(userId: string): Promise<SubscriptionPayment[]> {
        try {
            // Use RPC to bypass RLS and join agent details
            const { data, error } = await this.client.rpc('get_subscription_payments', {
                target_user_id: userId,
            });

            if (error) {
                console.error('Error fetching payment history:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Exception fetching payment history:', error);
            return [];
        }
    }
}

export const supabase = new SupabaseService();
export default supabase;
