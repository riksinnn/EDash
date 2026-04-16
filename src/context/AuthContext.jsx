import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

/**
 * Normalize user object to include displayName from various sources
 * Handles both email signups (display_name) and Google OAuth (full_name)
 */
const normalizeUser = (supabaseUser) => {
  if (!supabaseUser) return null;

  // Prioritize display_name, then full_name, then name.
  const displayName =
    supabaseUser.user_metadata?.display_name ||
    supabaseUser.user_metadata?.full_name ||
    supabaseUser.user_metadata?.name;

  return {
    ...supabaseUser,
    displayName: displayName,
    photoURL:
      supabaseUser.user_metadata?.picture ||
      supabaseUser.user_metadata?.avatar_url ||
      null,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start in loading state to check session

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) {
          setUser(normalizeUser(session?.user ?? null));
        }
      } catch (error) {
        console.error("Failed to get initial session:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setUser(normalizeUser(session?.user ?? null));
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    return data;
  };

  const signup = async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) throw error;

    // Update user metadata with display name
    if (data.user) {
      await supabase.auth.updateUser({
        data: {
          display_name: displayName,
        },
      });
    }

    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);