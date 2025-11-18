'use client';

import { supabase } from "@/helper/supabase";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [authId, setAuthId] = useState(null);
  const [counter, setCounter] = useState(0)
  const [store_code, setStoreCode] = useState(null);
  const [TOTAL, setTOTAL] = useState(0)

  useEffect(() => {
    // Load auth + branch from localStorage
    const savedAuth = localStorage.getItem("auth_id");
    const branch = JSON.parse(localStorage.getItem("branch_location") || "{}");

    setAuthId(savedAuth);
    setStoreCode(branch.branch_code || "");
  }, []);

  // Run fetchCart ONLY when authId + storeCode are ready
  useEffect(() => {
    if (!authId || !store_code) return;
    fetchCart();
  }, [authId, store_code]);

  const fetchCart = async () => {
    setCounter(counter + 1);

    if (!authId) {
      setCartItems([]);
      setTOTAL(0);
      return;
    }

    try {
      const { data: userData } = await supabase
        .from("users")
        .select("cart_item")
        .eq("id", authId)
        .single();

      let cart = userData?.cart_item || [];

      if (cart.length === 0) {
        setCartItems([]);
        setTOTAL(0);
        return;
      }

      // TEMP variable to compute total
      let computedTotal = 0;

      const updatedCart = await Promise.all(
        cart.map(async (item) => {
          const { pid, quantity } = item;

          const { data: inventory } = await supabase
            .from("inventory")
            .select("*, products(price, isSale, compare_at_price)")
            .eq("product_id", pid)
            .single();

          if (!inventory) {
            return {
              ...item,
              available: 0,
              out_of_stock: true,
            };
          }

          const priceToUse = inventory.products.isSale
            ? inventory.products.compare_at_price
            : inventory.products.price;

          // Add to local total
          computedTotal += quantity * priceToUse;

          const storeInv = inventory[store_code];
          const available = storeInv?.available || 0;

          return {
            ...item,
            out_of_stock: quantity > available,
          };
        })
      );

      // Set total ONCE after all calculations
      setTOTAL(computedTotal);
      setCartItems(updatedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("realtime-inventory")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "inventory",
        },
        async (payload) => {
          await fetchCart();
          console.log(cartItems)
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [counter]);

  const addToCart = async (product, qty) => {
    try {
      if (!localStorage.getItem("auth_id")) {
        alert("Please sign in first.");
        router.push("/signin");
        return;
      }

      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("cart_item")
        .eq("id", localStorage.getItem("auth_id"))
        .single();

      if (fetchError) throw fetchError;

      const currentCart = userData?.cart_item || [];
      const existingItemIndex = currentCart.findIndex(
        (item) => item.pid === product.id
      );

      if (existingItemIndex !== -1) {
        currentCart[existingItemIndex].quantity = qty;
        alert(
          `Product quantity updated to ${currentCart[existingItemIndex].quantity}`
        );
      } else {
        currentCart.push({ pid: product.id, quantity: qty });
        alert("Item added to cart!");
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ cart_item: currentCart })
        .eq("id", localStorage.getItem("auth_id"));

      if (updateError) throw updateError;
      await fetchCart();
    } catch (err) {
      console.error(err);
      alert("Failed to update cart.");
    }
  };

  const removeFromCart = async (productId) => {
    const auth_id = localStorage.getItem("auth_id")
    if (!auth_id) return;

    const { data: userData } = await supabase
      .from('users')
      .select('cart_item')
      .eq('id', auth_id)
      .single();

    const updatedCart = (userData?.cart_item || []).filter(item => item.pid !== productId);

    await supabase
      .from('users')
      .update({ cart_item: updatedCart })
      .eq('id', auth_id);

    await fetchCart();
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        TOTAL,
        setTOTAL,
        addToCart,
        removeFromCart,
        clearCart,
        store_code
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
