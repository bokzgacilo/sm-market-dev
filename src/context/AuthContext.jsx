import { useRouter } from "next/router";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/helper/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = useCallback(async (email) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) throw error;
      setUserData(data);
      setCartItems(data?.cart_item || []);
    } catch (err) {
      console.error("Error fetching user data:", err.message);
      setUserData(null);
      setCartItems([]);
    }
  })

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      if (currentUser) await fetchUserData(currentUser.email);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        if (currentUser) await fetchUserData(currentUser.email);
        else {
          setUserData(null);
          setCartItems([]);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const currentUser = data.user;
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.email);
        router.push("/profile")
        return { success: true, user: currentUser };
      }

      return { success: false, message: "No user found." };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // ✅ Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    setCartItems([]);
    router.push("/signin")
  };

  const refreshCart = async () => {
    if (!user) return;
    await fetchUserData(user.email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        cartItems,
        loading,
        signIn,
        signOut,
        refreshCart,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
