import { createContext, useContext, useCallback, useEffect, useState, useRef } from 'react';
import { cart as cartApi } from '../api/client';

const CART_STORAGE_KEY = 'colorsmith_cart';

const CartContext = createContext(null);

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function clearCartStorage() {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {}
}

function isLoggedIn() {
  return !!(localStorage.getItem('colorsmith_token') || localStorage.getItem('colorsmith_admin_token'));
}

// Normalize backend item to frontend shape
function normalizeItem(item) {
  return {
    lineId: item._id ?? item.lineId,
    productId: item.product?._id ?? item.product ?? item.productId,
    productName: item.productName ?? '',
    productImage: item.productImage ?? null,
    grade: item.grade ?? null,
    colors: Array.isArray(item.colors) ? item.colors : [],
    quantity: item.quantity ?? 1,
    unitPrice: item.unitPrice ?? 0,
    totalPrice: item.totalPrice ?? 0,
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialFetchDone = useRef(false);

  // Fetch cart from backend or load from storage
  const fetchCart = useCallback(async () => {
    if (isLoggedIn()) {
      try {
        const res = await cartApi.list();
        const items = (res.data?.data ?? []).map(normalizeItem);
        setCart(items);
        clearCartStorage(); // Clear local storage since we have backend data
      } catch {
        // Fallback to localStorage if API fails
        setCart(loadCartFromStorage());
      }
    } else {
      setCart(loadCartFromStorage());
    }
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchCart();
    }
  }, [fetchCart]);

  // Listen for login/logout events to refresh cart
  useEffect(() => {
    const onAuthChange = () => {
      fetchCart();
    };
    window.addEventListener('auth-logout', onAuthChange);
    window.addEventListener('auth-login', onAuthChange);
    return () => {
      window.removeEventListener('auth-logout', onAuthChange);
      window.removeEventListener('auth-login', onAuthChange);
    };
  }, [fetchCart]);

  // Save to localStorage only when not logged in
  useEffect(() => {
    if (!isLoggedIn() && !loading) {
      saveCartToStorage(cart);
    }
  }, [cart, loading]);

  // Helper: sort color ids so order doesn't matter when comparing
  const sortedColorIds = (colors) =>
    (Array.isArray(colors) ? colors : [])
      .map((c) => String(c.id ?? c._id ?? ''))
      .sort()
      .join(',');

  const addItem = useCallback(async (item) => {
    const payload = {
      product: item.productId,
      productName: item.productName ?? '',
      productImage: item.productImage ?? null,
      grade: item.grade ?? null,
      colors: Array.isArray(item.colors) ? item.colors : [],
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) ?? 0,
      totalPrice: Number(item.totalPrice) ?? 0,
    };

    if (isLoggedIn()) {
      try {
        const res = await cartApi.add(payload);
        const returned = normalizeItem(res.data?.data ?? res.data);
        const wasMerged = res.data?.merged === true;

        if (wasMerged) {
          // Update the existing line in state instead of appending
          setCart((prev) =>
            prev.map((line) => (line.lineId === returned.lineId ? returned : line))
          );
        } else {
          setCart((prev) => [...prev, returned]);
        }
        return returned.lineId;
      } catch (err) {
        console.error('Failed to add to cart', err);
        throw err;
      }
    } else {
      // Guest mode: merge locally if same product + grade + colors
      const incomingSorted = sortedColorIds(payload.colors);
      const gradeId = String(payload.grade?.id ?? '');

      setCart((prev) => {
        const existingIdx = prev.findIndex(
          (line) =>
            String(line.productId) === String(payload.product) &&
            String(line.grade?.id ?? '') === gradeId &&
            sortedColorIds(line.colors) === incomingSorted
        );

        if (existingIdx !== -1) {
          const existing = prev[existingIdx];
          const newQty = existing.quantity + payload.quantity;
          const updated = {
            ...existing,
            quantity: newQty,
            totalPrice: (existing.unitPrice ?? 0) * newQty,
          };
          const next = [...prev];
          next[existingIdx] = updated;
          return next;
        }

        // No match — add as new line
        const lineId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        return [...prev, { ...payload, lineId, productId: item.productId }];
      });

      // Return a placeholder lineId (guest merge doesn't need a real one)
      return null;
    }
  }, []);

  const removeItem = useCallback(async (lineId) => {
    if (isLoggedIn() && !lineId.startsWith('local-')) {
      try {
        await cartApi.remove(lineId);
      } catch (err) {
        console.error('Failed to remove from cart', err);
      }
    }
    setCart((prev) => prev.filter((item) => item.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback(async (lineId, quantity) => {
    const qty = Math.max(1, Math.floor(Number(quantity)) || 1);

    if (isLoggedIn() && !lineId.startsWith('local-')) {
      try {
        const res = await cartApi.update(lineId, { quantity: qty });
        const updated = normalizeItem(res.data?.data ?? res.data);
        setCart((prev) =>
          prev.map((item) => (item.lineId === lineId ? updated : item))
        );
        return;
      } catch (err) {
        console.error('Failed to update cart', err);
      }
    }

    // Guest mode or fallback
    setCart((prev) =>
      prev.map((item) =>
        item.lineId === lineId
          ? { ...item, quantity: qty, totalPrice: (item.unitPrice ?? 0) * qty }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(async () => {
    if (isLoggedIn()) {
      try {
        await cartApi.clear();
      } catch (err) {
        console.error('Failed to clear cart', err);
      }
    }
    setCart([]);
    clearCartStorage();
  }, []);

  // Merge localStorage cart into backend when user logs in
  const mergeLocalCartToBackend = useCallback(async () => {
    const localCart = loadCartFromStorage();
    if (localCart.length === 0 || !isLoggedIn()) return;

    for (const item of localCart) {
      try {
        await cartApi.add({
          product: item.productId,
          productName: item.productName ?? '',
          productImage: item.productImage ?? null,
          grade: item.grade ?? null,
          colors: item.colors ?? [],
          quantity: item.quantity ?? 1,
          unitPrice: item.unitPrice ?? 0,
          totalPrice: item.totalPrice ?? 0,
        });
      } catch {}
    }
    clearCartStorage();
    fetchCart();
  }, [fetchCart]);

  // Number of distinct items (lines) in cart, not sum of quantities
  const itemCount = cart.length;
  const subtotal = cart.reduce((sum, item) => sum + (item.totalPrice ?? 0), 0);
  // GST split into SGST (9%) and CGST (9%) = 18% total
  const SGST_RATE = 0.09; // 9% SGST
  const CGST_RATE = 0.09; // 9% CGST
  const sgstAmount = subtotal * SGST_RATE;
  const cgstAmount = subtotal * CGST_RATE;
  const gstAmount = sgstAmount + cgstAmount; // Total 18%
  const grandTotal = subtotal + gstAmount;

  const value = {
    cart,
    loading,
    itemCount,
    subtotal,
    sgstAmount,
    cgstAmount,
    gstAmount,
    grandTotal,
    SGST_RATE,
    CGST_RATE,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    fetchCart,
    mergeLocalCartToBackend,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
