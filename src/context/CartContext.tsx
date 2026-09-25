"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, CustomerOrderInfo, Product, ProductVariant, UnitType } from "@/types/product";
import { getUnitPrice, getOrderType, OrderType } from "@/lib/pricing";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, unitType: UnitType, qty: number, variant?: ProductVariant) => void;
  updateQty: (itemId: string, newQty: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  toggleSelect: (itemId: string) => void;
  selectAll: (selected: boolean) => void;
  totalItemsCount: number;
  selectedTotalCount: number;
  selectedTotalAmount: number;
  selectedOrderType: OrderType;
  customerInfo: CustomerOrderInfo;
  updateCustomerInfo: (info: Partial<CustomerOrderInfo>) => void;
  productsMap: Map<string, Product>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "khalifa_niaga_cart_v1";
const CUSTOMER_STORAGE_KEY = "khalifa_niaga_customer_v1";

const defaultCustomerInfo: CustomerOrderInfo = {
  storeName: "",
  customerName: "",
  whatsappNumber: "",
  address: "",
  notes: "",
};

export const CartProvider: React.FC<{ children: React.ReactNode; initialProducts?: Product[] }> = ({
  children,
  initialProducts = [],
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerOrderInfo>(defaultCustomerInfo);
  const [isLoaded, setIsLoaded] = useState(false);

  // Products map for looking up tiered prices when qty changes in cart
  const [productsMap] = useState<Map<string, Product>>(() => {
    const map = new Map<string, Product>();
    initialProducts.forEach((p) => map.set(p.id, p));
    return map;
  });

  // Sync produk live dari database ke productsMap
  useEffect(() => {
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((data) => {
        if (data.customerProducts) {
          data.customerProducts.forEach((p: Product) => {
            productsMap.set(p.id, p);
          });
        }
      })
      .catch(() => {});
  }, [productsMap]);

  // Load from localStorage on mount & pastikan harga dihitung independen per item
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedItems: CartItem[] = JSON.parse(savedCart);
        // Validasi dan pastikan harga satuan tiap item dihitung independen dari qty item itu sendiri
        const validatedItems = parsedItems.map((item) => {
          const prod = productsMap.get(item.productId);
          if (prod) {
            const tiers = item.unitType === "PAK" ? prod.tieredPricesPack : prod.tieredPricesPcs;
            const unitPrice = getUnitPrice(tiers, item.qty);
            return {
              ...item,
              unitPrice,
              subtotal: item.qty * unitPrice,
            };
          }
          return item;
        });
        setItems(validatedItems);
      }
      const savedCustomer = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (savedCustomer) {
        setCustomerInfo(JSON.parse(savedCustomer));
      }
    } catch (e) {
      console.error("Gagal memuat data dari localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, [productsMap]);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Gagal menyimpan keranjang:", e);
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customerInfo));
    } catch (e) {
      console.error("Gagal menyimpan info pelanggan:", e);
    }
  }, [customerInfo, isLoaded]);

  const addItem = (
    product: Product,
    unitType: UnitType,
    qty: number,
    variant?: ProductVariant
  ) => {
    if (qty <= 0) return;

    const itemId = `${product.id}__${variant ? variant.id : "default"}__${unitType}`;
    const tiers = unitType === "PAK" ? product.tieredPricesPack : product.tieredPricesPcs;
    const packRatio = unitType === "PAK" ? product.packRatio : 1;

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === itemId);

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.qty + qty;
        const newUnitPrice = getUnitPrice(tiers, newQty);
        const updatedItem: CartItem = {
          ...existing,
          qty: newQty,
          unitPrice: newUnitPrice,
          subtotal: newQty * newUnitPrice,
        };
        const updated = [...prev];
        updated[existingIndex] = updatedItem;
        return updated;
      } else {
        const unitPrice = getUnitPrice(tiers, qty);
        const newItem: CartItem = {
          id: itemId,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          category: product.category,
          image: (variant && variant.image) || product.images[0],
          variantId: variant?.id,
          variantName: variant?.name,
          unitType,
          packRatio,
          qty,
          unitPrice,
          subtotal: qty * unitPrice,
          selected: true,
        };
        return [...prev, newItem];
      }
    });
  };

  const updateQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;

        // Cari tiers dari productsMap
        const prod = productsMap.get(item.productId);
        let unitPrice = item.unitPrice;

        if (prod) {
          const tiers = item.unitType === "PAK" ? prod.tieredPricesPack : prod.tieredPricesPcs;
          unitPrice = getUnitPrice(tiers, newQty);
        }

        return {
          ...item,
          qty: newQty,
          unitPrice,
          subtotal: newQty * unitPrice,
        };
      })
    );
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleSelect = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, selected: !item.selected } : item))
    );
  };

  const selectAll = (selected: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected })));
  };

  const updateCustomerInfo = (info: Partial<CustomerOrderInfo>) => {
    setCustomerInfo((prev) => ({ ...prev, ...info }));
  };

  // Calculations
  const totalItemsCount = items.reduce((acc, curr) => acc + curr.qty, 0);

  const selectedItems = items.filter((item) => item.selected);
  const selectedTotalCount = selectedItems.reduce((acc, curr) => acc + curr.qty, 0);
  const selectedTotalAmount = selectedItems.reduce((acc, curr) => acc + curr.subtotal, 0);
  const selectedOrderType = getOrderType(selectedItems, undefined, productsMap);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        toggleSelect,
        selectAll,
        totalItemsCount,
        selectedTotalCount,
        selectedTotalAmount,
        selectedOrderType,
        customerInfo,
        updateCustomerInfo,
        productsMap,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart harus digunakan di dalam CartProvider");
  }
  return context;
};
