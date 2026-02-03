import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Track analytics event
 * Non-blocking, fire-and-forget pattern
 * Fails silently to not impact user experience
 */
export const trackEvent = async (
  eventName: string,
  metadata: Record<string, any> = {}
): Promise<void> => {
  try {
    // Fire and forget - don't await
    api.post('/api/analytics/track', {
      event_name: eventName,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        platform: 'mobile',
      },
    }).catch((error) => {
      // Silently fail - log but don't throw
      console.log('[Analytics] Event tracking failed:', eventName, error.message);
    });
  } catch (error) {
    // Silently fail
    console.log('[Analytics] Event tracking error:', eventName);
  }
};

/**
 * Track first-time core action
 * Uses AsyncStorage to ensure it only fires once per user
 */
export const trackFirstCoreAction = async (
  actionName: string,
  metadata: Record<string, any> = {}
): Promise<void> => {
  try {
    const key = `first_core_action_${actionName}`;
    const hasTracked = await AsyncStorage.getItem(key);
    
    if (!hasTracked) {
      await trackEvent('first_core_action', {
        action_name: actionName,
        ...metadata,
      });
      await AsyncStorage.setItem(key, 'true');
    }
  } catch (error) {
    console.log('[Analytics] First core action tracking error');
  }
};

/**
 * Track app lifecycle events
 */
export const trackAppOpen = () => trackEvent('app_open');
export const trackSessionStart = () => trackEvent('session_start');

/**
 * Track auth events
 */
export const trackSignupComplete = (userId: string) => 
  trackEvent('signup_complete', { user_id: userId });

export const trackLoginComplete = (userId: string) => 
  trackEvent('login_complete', { user_id: userId });

/**
 * Track activation funnel
 */
export const trackProfileCompleted = () => 
  trackEvent('profile_completed');

/**
 * Track engagement
 */
export const trackCoreAction = (actionType: string, metadata: Record<string, any> = {}) =>
  trackEvent('core_action', { action_type: actionType, ...metadata });

/**
 * Track community actions (core actions for this app)
 */
export const trackJoinCommunity = (communityId: string) =>
  trackCoreAction('join_community', { community_id: communityId });

export const trackViewCommunity = (communityId: string) =>
  trackCoreAction('view_community', { community_id: communityId });

export const trackSearchCommunity = (query: string) =>
  trackCoreAction('search_community', { query });

/**
 * Initialize analytics on app start
 */
export const initAnalytics = async () => {
  await trackAppOpen();
  await trackSessionStart();
};
