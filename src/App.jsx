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

import CheckoutSuccess from './pages/CheckoutSuccess.jsx';
import AdminContentEditor from './pages/AdminContentEditor.jsx';


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
          <Layout currentPageName="AdminDashboard">
            <AdminDashboard />
          </Layout>
        }
      />
      <Route
        path="/admin/products"
        element={
          <Layout currentPageName="AdminProducts">
            <AdminProducts />
          </Layout>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <Layout currentPageName="AdminOrders">
            <AdminOrders />
          </Layout>
        }
      />
      <Route
        path="/admin/shipping"
        element={
          <Layout currentPageName="AdminShipping">
            <AdminShipping />
          </Layout>
        }
      />
      <Route
        path="/admin/content"
        element={
          <Layout currentPageName="AdminContentEditor">
            <AdminContentEditor />
          </Layout>
        }
      />


      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
