import { useState } from "react";
import Searchbar from "../components/Searchbar";
import axios from "axios";
import ProductsGRid from "../components/ProductsGRid";
import CardsSkeleton from "../components/CardsSkeleton";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    if (searchQuery === "") {
      const { data } = await axios.get("http://localhost:5000/api/product/all");

      return data.products;
    } else {
      const { data } = await axios.get(
        `http://localhost:5000/api/product/search?q=${searchQuery}`
      );
      return data.products;
    }
  };

  const {
    isLoading,
    error,
    data: products,
  } = useQuery(
    { queryKey: ["products", searchQuery], queryFn: fetchProducts },
    { staleTime: 1000 * 60, refetchOnWindowFocus: false }
  );

  if (isLoading) {
    return (
      <div className="pt-20 flex flex-col gap-10 items-center">
        <Searchbar _setSearchQuery={setSearchQuery} />
        <div className="w-full h-screen flex flex-col items-center gap-14">
          <h1 className="font-serif text-xl text-gray-200 font-medium">
            Products
          </h1>
          <p
            className={`${
              searchQuery === ""
                ? "hidden"
                : "block self-start ml-24 text-gray-200 font-sans text-base"
            }`}
          >
            Showing results for: <q>{searchQuery}</q>
          </p>
          <CardsSkeleton />
        </div>
      </div>
    );
  }

  if (error?.response?.status === 404) {
    toast.error(error.response.data.message);
    return (
      <div className="pt-20 flex flex-col gap-10 items-center">
        <Searchbar _setSearchQuery={setSearchQuery} />
        <div className="w-full h-screen flex flex-col items-center gap-14">
          <h1 className="font-serif text-xl text-gray-200 font-medium">
            Products
          </h1>
          <p
            className={`${
              searchQuery === ""
                ? "hidden"
                : "block self-start ml-24 text-gray-200 font-sans text-base"
            }`}
          >
            Showing results for: <q>{searchQuery}</q>
          </p>
          <p className="font-serif text-xl text-gray-200 font-medium">
            No products found matching your query
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log(error.message);
    return;
  }
  return (
    <div className="pt-20 flex flex-col gap-10 items-center">
      <Searchbar _setSearchQuery={setSearchQuery} />
      <div className="w-full h-screen flex flex-col items-center gap-14">
        <h1 className="font-serif text-xl text-gray-200 font-medium">
          Products
        </h1>
        <p
          className={`${
            searchQuery === ""
              ? "hidden"
              : "block self-start ml-24 text-gray-200 font-sans text-base"
          }`}
        >
          Showing results for: <q>{searchQuery}</q>
        </p>
        <ProductsGRid products={products} />
      </div>
    </div>
  );
};

export default Products;
