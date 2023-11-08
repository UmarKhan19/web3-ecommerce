import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import CardsSkeleton from "./CardsSkeleton";
import ProductsGRid from "./ProductsGRid";

const Products = () => {
  const fetchProducts = async () => {
    const {
      data: { products },
    } = await axios.get("http://localhost:5000/api/product/all");
    return products;
  };

  const {
    isLoading,
    error,
    data: products,
  } = useQuery(
    { queryKey: ["products"], queryFn: fetchProducts },
    { staleTime: 1000 * 60, refetchOnWindowFocus: false }
  );

  if (isLoading) {
    return <CardsSkeleton />;
  }

  if (error) {
    return toast.error(error.message);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
      <h2 className="text-2xl font-bold tracking-tight text-gray-300">
        Products
      </h2>
      <ProductsGRid products={products} />
    </div>
  );
};

export default Products;
