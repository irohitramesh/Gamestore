import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Toast.css';

const iconMap = {
    success: <CheckCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />
};

const Toast = () => {
    const { notifications } = useCart();

    return (
        <div className="toast-container">
            <AnimatePresence>
                {notifications.map(notification => (
                    <motion.div
                        key={notification.id}
                        className={`toast toast-${notification.type}`}
                        initial={{ opacity: 0, y: -20, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="toast-icon">{iconMap[notification.type]}</span>
                        <span className="toast-message">{notification.message}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Toast;
