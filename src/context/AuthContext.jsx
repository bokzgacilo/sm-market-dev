import { useRouter } from "next/router";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "@/helper/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();

  // Fetch user data from Supabase 'users' table
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
  }, []);

  // Sign in function
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const currentUser = data.user;
      const session = data.session;

      if (currentUser && session) {
        setUser(currentUser);

        // Save session in localStorage
        localStorage.setItem(
          "authSession",
          JSON.stringify({
            user: currentUser,
            session: session,
            status: "authenticated",
          })
        );

        await fetchUserData(currentUser.email);
        router.push("/profile");

        return { success: true, user: currentUser };
      }

      return { success: false, message: "No user found." };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserData(null);
    setCartItems([]);
    localStorage.removeItem("authSession");
    router.push("/signin");
  };

  // Refresh cart function
  const refreshCart = async () => {
    if (!user?.email) return;
    await fetchUserData(user.email);
  };

  useEffect(() => {
    // Initialize auth from localStorage or Supabase
    const initAuth = async () => {
      const storedAuth = localStorage.getItem("authSession");

      if (storedAuth) {
        const { user: storedUser, session, status } = JSON.parse(storedAuth);
        if (status === "authenticated" && storedUser && session) {
          setUser(storedUser);
          await fetchUserData(storedUser.email);
          return;
        }
      }

      // Fallback to Supabase session
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      if (currentUser) await fetchUserData(currentUser.email);
    };

    initAuth();

    // Supabase auth state listener (syncs localStorage across tabs)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          await fetchUserData(currentUser.email);
          localStorage.setItem(
            "authSession",
            JSON.stringify({
              user: currentUser,
              session: session,
              status: "authenticated",
            })
          );
        } else {
          setUserData(null);
          setCartItems([]);
          localStorage.removeItem("authSession");
        }
      }
    );

    // Listen to localStorage changes from other tabs
    const handleStorageChange = async (event) => {
      if (event.key === "authSession") {
        const storedAuth = localStorage.getItem("authSession");

        if (storedAuth) {
          const { user: storedUser, status } = JSON.parse(storedAuth);
          if (status === "authenticated" && storedUser) {
            setUser(storedUser);
            await fetchUserData(storedUser.email);
          }
        } else {
          // Logged out in another tab
          setUser(null);
          setUserData(null);
          setCartItems([]);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchUserData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        cartItems,
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
