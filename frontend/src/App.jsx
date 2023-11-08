import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import { Routes, Route } from "react-router-dom";
import SingleProduct from "./pages/SingleProduct";
import { Toaster } from "react-hot-toast";
import Orders from "./pages/Orders";

function App() {
  return (
    <>
      <Navbar />
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/contact" element={<Home />} />
        <Route path="/product/:id" element={<SingleProduct />} />
      </Routes>
    </>
  );
}

export default App;
