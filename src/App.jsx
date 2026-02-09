import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout.jsx';

import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Candlie from './pages/Candlie.jsx';
import Contact from './pages/Contact.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';

import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminShipping from './pages/AdminShipping.jsx';
import AdminLegal from './pages/AdminLegal.jsx';
import AdminCoupons from './pages/AdminCoupons.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminAuthGuard from './components/admin/AdminAuthGuard.jsx';
import AdminFeedbacks from './pages/AdminFeedbacks.jsx';

import CheckoutSuccess from './pages/CheckoutSuccess.jsx';
import AdminContentEditor from './pages/AdminContentEditor.jsx';
import Aszf from './pages/Aszf.jsx';
import Privacy from './pages/Privacy.jsx';


export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout currentPageName="Home">
            <Home />
          </Layout>
        }
      />
      <Route
        path="/products"
        element={
          <Layout currentPageName="Products">
            <Products />
          </Layout>
        }
      />
      <Route
        path="/product"
        element={
          <Layout currentPageName="ProductDetail">
            <ProductDetail />
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout currentPageName="Candlie">
            <Candlie />
          </Layout>
        }
      />
      <Route
        path="/candlie"
        element={
          <Layout currentPageName="Candlie">
            <Candlie />
          </Layout>
        }
      />
      <Route
        path="/contact"
        element={
          <Layout currentPageName="Contact">
            <Contact />
          </Layout>
        }
      />
      <Route
        path="/aszf"
        element={
          <Layout currentPageName="ASZF">
            <Aszf />
          </Layout>
        }
      />
      <Route
        path="/adatkezeles"
        element={
          <Layout currentPageName="Privacy">
            <Privacy />
          </Layout>
        }
      />
      <Route
        path="/cart"
        element={
          <Layout currentPageName="Cart">
            <Cart />
          </Layout>
        }
      />
      <Route
        path="/checkout"
        element={
          <Layout currentPageName="Checkout">
            <Checkout />
          </Layout>
        }
      />
      <Route
        path="/checkout/success"
        element={
          <Layout currentPageName="CheckoutSuccess">
            <CheckoutSuccess />
          </Layout>
        }
      />
      


      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminAuthGuard>
            <Layout currentPageName="AdminDashboard">
              <AdminDashboard />
            </Layout>
          </AdminAuthGuard>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminAuthGuard>
            <Layout currentPageName="AdminProducts">
              <AdminProducts />
            </Layout>
          </AdminAuthGuard>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminAuthGuard>
            <Layout currentPageName="AdminOrders">
              <AdminOrders />
            </Layout>
          </AdminAuthGuard>
        }
      />
      <Route
        path="/admin/shipping"
        element={
          <AdminAuthGuard>
            <Layout currentPageName="AdminShipping">
              <AdminShipping />
            </Layout>
          </AdminAuthGuard>
        }
      />
      <Route
        path="/admin/content"
        element={
          <AdminAuthGuard>
            <Layout currentPageName="AdminContentEditor">
              <AdminContentEditor />
            </Layout>
          </AdminAuthGuard>
        }
      />
      <Route
        path="/admin/feedbacks"
        element={
          <AdminAuthGuard>
            <Layout currentPageName="AdminFeedbacks">
              <AdminFeedbacks />
            </Layout>
          </AdminAuthGuard>
        }
      />
      <Route
        path="/admin/legal"
        element={
          <AdminAuthGuard>
            <Layout currentPageName="AdminLegal">
              <AdminLegal />
            </Layout>
          </AdminAuthGuard>
        }
      />
      <Route
        path="/admin/coupons"
        element={
          <AdminAuthGuard>
            <Layout currentPageName="AdminCoupons">
              <AdminCoupons />
            </Layout>
          </AdminAuthGuard>
        }
      />
      <Route path="/admin/login" element={<AdminLogin />} />


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
