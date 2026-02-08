import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CategoriesList from './pages/CategoriesList';
import Login from './pages/Login';
import Register from './pages/Register';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import MyColorSets from './pages/MyColorSets';
import ColorSetDetail from './pages/ColorSetDetail';
import ColorSetEdit from './pages/ColorSetEdit';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCategoryForm from './pages/admin/AdminCategoryForm';
import AdminProducts from './pages/admin/AdminProducts';
import AdminGrades from './pages/admin/AdminGrades';
import AdminColors from './pages/admin/AdminColors';
import AdminColorSets from './pages/admin/AdminColorSets';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import Policies from './pages/Policies';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes with Navbar and Footer */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home/>} />
              <Route path="categories" element={<CategoriesList />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
              <Route path="orders" element={<Orders />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="my-color-sets" element={<MyColorSets />} />
              <Route path="color-set/:id" element={<ColorSetDetail />} />
              <Route path="color-set/:id/edit" element={<ColorSetEdit />} />
              <Route path="policies/:slug" element={<Policies />} />
            </Route>
            
            {/* Admin routes without public Navbar and Footer */}
            <Route path="admin/login" element={<AdminLoginPage />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="categories/new" element={<AdminCategoryForm />} />
              <Route path="categories/:id/edit" element={<AdminCategoryForm />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="grades" element={<AdminGrades />} />
              <Route path="colors" element={<AdminColors />} />
              <Route path="color-sets" element={<AdminColorSets />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
