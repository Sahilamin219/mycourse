import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api';
import { authLogger } from '../utils/logger';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string;
  subscription_status: string;
  points: number;
  level: number;
  badges: string[];
  streak_days: number;
  debates_completed: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authLogger.info('Initializing auth context');
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      authLogger.debug('Found stored auth credentials, restoring session');
      try {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
        authLogger.debug('Validating stored session with backend');
        api.getCurrentUser(storedToken).then((user) => {
          authLogger.info('Session validated successfully', { userId: user.id });
          setUser(user);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }).catch((error) => {
          authLogger.warn('Session validation failed, clearing stored credentials', { error: error.message });
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setAccessToken(null);
          setUser(null);
        });
      } catch (error) {
        authLogger.error('Failed to parse stored credentials', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } else {
      authLogger.debug('No stored credentials found');
    }

    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    authLogger.info('Sign in initiated', { email });
    setLoading(true);
    try {
      const response = await api.signIn(email, password);
      authLogger.info('Sign in successful, storing credentials', { userId: response.user.id });
      setAccessToken(response.access_token);
      setUser(response.user);
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      authLogger.debug('Auth credentials stored in localStorage');
    } catch (error) {
      authLogger.error('Sign in failed in AuthContext', error, { email });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    authLogger.info('Sign up initiated', { email, hasFullName: !!fullName });
    setLoading(true);
    try {
      const response = await api.signUp(email, password, fullName);
      authLogger.info('Sign up successful, storing credentials', { userId: response.user.id });
      setAccessToken(response.access_token);
      setUser(response.user);
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      authLogger.debug('Auth credentials stored in localStorage');
    } catch (error) {
      authLogger.error('Sign up failed in AuthContext', error, { email });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    authLogger.info('Google sign in initiated');
    setLoading(true);
    
    try {
      // Wait for Google Identity Services to load
      if (typeof window === 'undefined') {
        throw new Error('Window is not available');
      }

      // Wait for Google to be available
      await new Promise<void>((resolve, reject) => {
        if ((window as any).google) {
          resolve();
          return;
        }
        
        let attempts = 0;
        const checkGoogle = setInterval(() => {
          attempts++;
          if ((window as any).google) {
            clearInterval(checkGoogle);
            resolve();
          } else if (attempts > 50) {
            clearInterval(checkGoogle);
            reject(new Error('Google Identity Services failed to load'));
          }
        }, 100);
      });

      const google = (window as any).google;
      const clientId = '938233228671-8ubrr8imhf09e98qns67ep554901a91n.apps.googleusercontent.com'// import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
      }

      // Use OAuth2 flow to get access token and user info
      return new Promise<void>((resolve, reject) => {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          callback: async (tokenResponse: any) => {
            try {
              if (tokenResponse.error) {
                throw new Error(tokenResponse.error);
              }

              if (!tokenResponse.access_token) {
                throw new Error('No access token received from Google');
              }

              // Get user info from Google
              const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`,
                },
              });

              if (!userInfoResponse.ok) {
                throw new Error('Failed to get user info from Google');
              }

              const userInfo = await userInfoResponse.json();
              authLogger.debug('Google user info received', { email: userInfo.email });

              // Send to backend for authentication
              const authResponse = await api.signInWithGoogle(userInfo);
              
              authLogger.info('Google sign in successful, storing credentials', { userId: authResponse.user.id });
              setAccessToken(authResponse.access_token);
              setUser(authResponse.user);
              localStorage.setItem(TOKEN_KEY, authResponse.access_token);
              localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
              authLogger.debug('Auth credentials stored in localStorage');
              
              setLoading(false);
              resolve();
            } catch (error) {
              authLogger.error('Google sign in failed in AuthContext', error);
              setLoading(false);
              reject(error);
            }
          },
        });

        // Request access token (this will show the Google sign-in popup)
        tokenClient.requestAccessToken();
      });
    } catch (error) {
      authLogger.error('Google sign in failed', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    authLogger.info('Sign out initiated', { userId: user?.id });
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    authLogger.info('Sign out complete');
  };

  return (
    <AuthContext.Provider value={{ user, loading, accessToken, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
