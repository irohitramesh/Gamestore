import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loaded, setLoaded] = useState(false);

    // Load cart from Firestore when user changes
    useEffect(() => {
        const loadCart = async () => {
            if (user?.uid) {
                try {
                    const cartDoc = await getDoc(doc(db, 'carts', user.uid));
                    if (cartDoc.exists()) {
                        setCartItems(cartDoc.data().items || []);
                    } else {
                        setCartItems([]);
                    }
                } catch (err) {
                    console.error('Error loading cart:', err);
                    setCartItems([]);
                }
            } else {
                setCartItems([]);
            }
            setLoaded(true);
        };
        loadCart();
    }, [user?.uid]);

    // Save cart to Firestore whenever it changes
    useEffect(() => {
        if (!loaded || !user?.uid) return;
        const saveCart = async () => {
            try {
                await setDoc(doc(db, 'carts', user.uid), {
                    items: cartItems,
                    updatedAt: new Date().toISOString()
                });
            } catch (err) {
                console.error('Error saving cart:', err);
            }
        };
        saveCart();
    }, [cartItems, user?.uid, loaded]);

    const addNotification = useCallback((message, type = 'success') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    }, []);

    const addToCart = useCallback((game) => {
        setCartItems(prev => {
            const exists = prev.find(item => item.id === game.id);
            if (exists) {
                addNotification(`${game.title} is already in your cart`, 'info');
                return prev;
            }
            addNotification(`${game.title} added to cart!`, 'success');
            return [...prev, { id: game.id, title: game.title, price: game.price, discount: game.discount, genre: game.genre, media_urls: game.media_urls, quantity: 1 }];
        });
    }, [addNotification]);

    const removeFromCart = useCallback((gameId) => {
        setCartItems(prev => {
            const item = prev.find(i => i.id === gameId);
            if (item) {
                addNotification(`${item.title} removed from cart`, 'info');
            }
            return prev.filter(item => item.id !== gameId);
        });
    }, [addNotification]);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const isInCart = useCallback((gameId) => {
        return cartItems.some(item => item.id === gameId);
    }, [cartItems]);

    const getCartTotal = useCallback(() => {
        return cartItems.reduce((total, item) => {
            const discountedPrice = item.discount > 0
                ? item.price - (item.price * (item.discount / 100))
                : item.price;
            return total + discountedPrice;
        }, 0);
    }, [cartItems]);

    const getCartSubtotal = useCallback(() => {
        return cartItems.reduce((total, item) => total + item.price, 0);
    }, [cartItems]);

    const getCartDiscount = useCallback(() => {
        return cartItems.reduce((total, item) => {
            if (item.discount > 0) {
                return total + (item.price * (item.discount / 100));
            }
            return total;
        }, 0);
    }, [cartItems]);

    const cartCount = cartItems.length;

    return (
        <CartContext.Provider value={{
            cartItems,
            cartCount,
            addToCart,
            removeFromCart,
            clearCart,
            isInCart,
            getCartTotal,
            getCartSubtotal,
            getCartDiscount,
            notifications
        }}>
            {children}
        </CartContext.Provider>
    );
};
