import { BrowserRouter, Link, Route, Routes } from 'react-router';
import { ShopProvider } from './context/ShopContext';
import { ShopDrawer } from './components/ShopDrawer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminLayout, AdminProductsPage, AdminCatalogsPage, AdminProductEditor } from './pages/AdminPage';

export default function App(){return <BrowserRouter><ShopProvider><Routes>
  <Route path="/" element={<HomePage/>}/>
  <Route path="/catalog" element={<CatalogPage/>}/>
  <Route path="/catalog/" element={<CatalogPage/>}/>
  <Route path="/catalog.html" element={<CatalogPage/>}/>
  <Route path="/product/:id" element={<ProductPage/>}/>
  <Route path="/product.html" element={<ProductPage legacy/>}/>
  <Route path="/auth" element={<AuthPage/>}/>
  <Route path="/reg" element={<AuthPage initialTab="register"/>}/>
  <Route path="/profile" element={<ProfilePage/>}/>
  <Route path="/manage" element={<AdminLayout/>}>
    <Route index element={<AdminProductsPage/>}/>
    <Route path="catalogs" element={<AdminCatalogsPage/>}/>
    <Route path="products/new" element={<AdminProductEditor/>}/>
    <Route path="products/:id/edit" element={<AdminProductEditor/>}/>
  </Route>
  <Route path="*" element={<main className="sz-404"><h1>Страница не найдена</h1><Link to="/">На главную →</Link></main>}/>
</Routes><ShopDrawer/></ShopProvider></BrowserRouter>}
