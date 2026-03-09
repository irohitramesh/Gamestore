import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import Home from './pages/Home';
import CartCheckout from './pages/CartCheckout';
import Dashboard from './pages/Dashboard';
import GameListing from './pages/GameListing';
import GameDetail from './pages/GameDetail';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Header from './components/Header';
import Toast from './components/Toast';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <Router>
                        <div className="app-container">
                            <Header />
                            <Toast />
                            <main className="main-content" id="main-content">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/games" element={<GameListing />} />
                                    <Route path="/games/:id" element={<GameDetail />} />
                                    <Route path="/cart" element={<CartCheckout />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/wishlist" element={<Wishlist />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/signup" element={<Signup />} />
                                </Routes>
                            </main>
                        </div>
                    </Router>
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
