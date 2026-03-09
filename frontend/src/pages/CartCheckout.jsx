import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, CheckCircle, ShoppingCart, Trash2, ShieldCheck, Lock, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from 'firebase/firestore';
import './CartCheckout.css';

const CartCheckout = () => {
    const navigate = useNavigate();
    const { cartItems, removeFromCart, clearCart, getCartTotal, getCartSubtotal, getCartDiscount } = useCart();
    const { isAuthenticated, user } = useAuth();

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardType, setCardType] = useState('saved');
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const total = getCartTotal();

    const handleCVVChange = (e) => {
        const val = e.target.value;
        if (/^\d{0,3}$/.test(val)) setCvv(val);
    };

    const formatCardNumber = (val) => {
        const cleaned = val.replace(/\D/g, '').slice(0, 16);
        return cleaned.replace(/(.{4})/g, '$1 ').trim();
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        // Require login only at payment time
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (paymentMethod === 'upi' && !upiId.includes('@')) {
            alert('Please enter a valid UPI ID (e.g., username@bank)');
            return;
        }

        if (paymentMethod === 'card' && cardType === 'new') {
            if (cardNumber.replace(/\s/g, '').length < 15 || !expiry || cvv.length !== 3) {
                alert('Please fill out all card details correctly. CVV must be exactly 3 digits.');
                return;
            }
        }

        setIsProcessing(true);
        try {
            // Save order to Firestore
            const order = {
                items: cartItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    discount: item.discount || 0,
                    finalPrice: item.discount > 0 ? +(item.price - (item.price * (item.discount / 100))).toFixed(2) : item.price
                })),
                total: +total.toFixed(2),
                paymentMethod,
                date: new Date().toISOString(),
                status: 'Completed'
            };

            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                await updateDoc(userDocRef, {
                    orders: arrayUnion(order),
                    library: arrayUnion(...cartItems.map(item => item.id))
                });
            } else {
                await setDoc(userDocRef, {
                    orders: [order],
                    library: cartItems.map(item => item.id)
                });
            }

            setIsProcessing(false);
            setPaymentSuccess(true);
            clearCart();
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err) {
            console.error('Error processing order:', err);
            setIsProcessing(false);
            alert('An error occurred while processing your order. Please try again.');
        }
    };

    if (paymentSuccess) {
        return (
            <div className="checkout-success-page">
                <motion.div
                    className="success-message-card"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                >
                    <div className="success-icon-wrapper">
                        <CheckCircle size={64} className="success-icon" />
                    </div>
                    <h2>Payment Successful!</h2>
                    <p>Your games have been added to your Library.</p>
                    <p className="redirecting-text">Redirecting to Dashboard...</p>
                </motion.div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="checkout-success-page">
                <div className="empty-cart-container">
                    <ShoppingCart size={64} className="empty-icon" />
                    <h2>Your Cart is Empty</h2>
                    <p>Looks like you haven't added any games yet.</p>
                    <button className="cta-btn" onClick={() => navigate('/games')}>Browse Games</button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="cart-checkout-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="checkout-header">
                <h2>
                    <Lock size={22} />
                    Secure Checkout
                </h2>
            </div>

            <div className="checkout-content">
                {/* Left - Order Items */}
                <div className="checkout-left">
                    <div className="order-summary-header">
                        <h3>Order Summary</h3>
                        <span className="item-count">{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</span>
                    </div>

                    <div className="cart-items-list">
                        <AnimatePresence>
                            {cartItems.map(item => {
                                const itemPrice = item.discount > 0
                                    ? (item.price - (item.price * (item.discount / 100))).toFixed(2)
                                    : item.price.toFixed(2);

                                return (
                                    <motion.div
                                        key={item.id}
                                        className="cart-item"
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20, height: 0, padding: 0, margin: 0 }}
                                    >
                                        <div className="item-thumbnail" onClick={() => navigate(`/games/${item.id}`)}>
                                            <img
                                                src={item.media_urls?.cover}
                                                alt={item.title}
                                                onError={(e) => { e.target.src = `https://placehold.co/160x90/1a1a2e/00d4ff?text=${encodeURIComponent(item.title.charAt(0))}`; }}
                                            />
                                        </div>
                                        <div className="item-details">
                                            <h4 onClick={() => navigate(`/games/${item.id}`)}>{item.title}</h4>
                                            <span className="item-genre">{item.genre?.slice(0, 2).join(' • ')}</span>
                                            <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                        <div className="item-price">
                                            {item.discount > 0 && (
                                                <div className="discount-tag">-{item.discount}%</div>
                                            )}
                                            <div className="pricing-col">
                                                {item.discount > 0 && <span className="strike-price">${item.price.toFixed(2)}</span>}
                                                <span className="final-price">${itemPrice}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    <Link to="/games" className="continue-shopping">← Continue Shopping</Link>
                </div>

                {/* Right - Payment */}
                <div className="checkout-right">
                    <div className="summary-card">
                        <h3>Payment Details</h3>
                        <div className="cost-breakdown">
                            <div className="cost-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="cost-row discount-row">
                                    <span>Discount</span>
                                    <span>-${discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="cost-row total-row">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <form className="payment-form" onSubmit={handleCheckout}>
                            <h4>Payment Method</h4>
                            <div className="payment-method-selector">
                                <label className={`method-card ${paymentMethod === 'card' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={() => setPaymentMethod('card')}
                                    />
                                    <CreditCard size={22} />
                                    <span>Card</span>
                                </label>
                                <label className={`method-card ${paymentMethod === 'upi' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="upi"
                                        checked={paymentMethod === 'upi'}
                                        onChange={() => setPaymentMethod('upi')}
                                    />
                                    <Smartphone size={22} />
                                    <span>UPI</span>
                                </label>
                            </div>

                            <AnimatePresence mode="wait">
                                {paymentMethod === 'card' && (
                                    <motion.div
                                        className="payment-details-section"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        key="card-section"
                                    >
                                        <div className="card-type-selector">
                                            <label>
                                                <input type="radio" name="cardType" checked={cardType === 'saved'} onChange={() => setCardType('saved')} />
                                                Use Saved Card (Visa ending in 4242)
                                            </label>
                                            <label>
                                                <input type="radio" name="cardType" checked={cardType === 'new'} onChange={() => setCardType('new')} />
                                                Enter New Card
                                            </label>
                                        </div>

                                        {cardType === 'new' && (
                                            <motion.div
                                                className="new-card-form"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <div className="form-group">
                                                    <label>Card Number</label>
                                                    <input
                                                        type="text"
                                                        placeholder="0000 0000 0000 0000"
                                                        maxLength="19"
                                                        value={cardNumber}
                                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group half">
                                                        <label>Expiry Date</label>
                                                        <input
                                                            type="month"
                                                            className="calendar-input"
                                                            value={expiry}
                                                            onChange={(e) => setExpiry(e.target.value)}
                                                            required
                                                            min={new Date().toISOString().slice(0, 7)}
                                                        />
                                                    </div>
                                                    <div className="form-group half">
                                                        <label>CVV (3 Digits)</label>
                                                        <input
                                                            type="password"
                                                            placeholder="•••"
                                                            value={cvv}
                                                            onChange={handleCVVChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {paymentMethod === 'upi' && (
                                    <motion.div
                                        className="payment-details-section"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        key="upi-section"
                                    >
                                        <div className="form-group">
                                            <label>UPI ID (VPA)</label>
                                            <input
                                                type="text"
                                                placeholder="username@bank"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <p className="helper-text">You will receive a payment request on your UPI app.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                className="cta-btn checkout-btn"
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <span className="processing-text">
                                        <span className="spinner"></span>
                                        Processing...
                                    </span>
                                ) : (
                                    <>
                                        <ShieldCheck size={18} />
                                        Pay ${total.toFixed(2)}
                                    </>
                                )}
                            </button>

                            <p className="secure-notice">
                                <Lock size={12} /> Secured by 256-bit SSL encryption
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CartCheckout;
