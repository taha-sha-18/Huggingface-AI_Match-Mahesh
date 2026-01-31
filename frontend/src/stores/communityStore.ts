import { create } from 'zustand';
import { Community, CommunityMatch } from '../types';
import api from '../utils/api';

interface CommunityState {
  communities: Community[];
  matches: CommunityMatch[];
  myCommun ities: Community[];
  isLoading: boolean;
  fetchCommunities: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchMyCommunities: () => Promise<void>;
  joinCommunity: (communityId: string) => Promise<void>;
  leaveCommunity: (communityId: string) => Promise<void>;
  skipCommunity: (communityId: string) => Promise<void>;
  createCommunity: (data: any) => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  communities: [],
  matches: [],
  myCommunities: [],
  isLoading: false,

  fetchCommunities: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/api/communities');
      set({ communities: response.data });
    } catch (error) {
      console.error('Fetch communities error:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMatches: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get('/api/matches');
      set({ matches: response.data });
    } catch (error: any) {
      console.error('Fetch matches error:', error);
      if (error.response?.status === 400) {
        // User hasn't completed game yet
        set({ matches: [] });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyCommunities: async () => {
    try {
      const response = await api.get('/api/communities/my/joined');
      set({ myCommunities: response.data });
    } catch (error) {
      console.error('Fetch my communities error:', error);
    }
  },

  joinCommunity: async (communityId: string) => {
    try {
      await api.post(`/api/communities/${communityId}/join`);
      await get().fetchMyCommunities();
      await get().fetchMatches();
    } catch (error) {
      console.error('Join community error:', error);
      throw error;
    }
  },

  leaveCommunity: async (communityId: string) => {
    try {
      await api.post(`/api/communities/${communityId}/leave`);
      await get().fetchMyCommunities();
    } catch (error) {
      console.error('Leave community error:', error);
      throw error;
    }
  },

  skipCommunity: async (communityId: string) => {
    try {
      await api.post(`/api/communities/${communityId}/skip`);
      // Remove from matches
      const matches = get().matches.filter(m => m.community_id !== communityId);
      set({ matches });
    } catch (error) {
      console.error('Skip community error:', error);
    }
  },

  createCommunity: async (data: any) => {
    try {
      await api.post('/api/communities', data);
      await get().fetchCommunities();
      await get().fetchMyCommunities();
    } catch (error) {
      console.error('Create community error:', error);
      throw error;
    }
  },
}));
