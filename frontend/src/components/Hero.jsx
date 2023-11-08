import { Link } from "react-router-dom";
import Slider from "./Slider";
import { motion } from "framer-motion";
const Hero = () => {
  const images = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=60",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJvZHVjdHN8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZHVjdHN8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&w=500&q=60",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZHVjdHN8ZW58MHx8MHx8fDI%3D&auto=format&fit=crop&w=500&q=60",
  ];

  return (
    <section className="flex flex-col md:flex-row h-screen pt-16 md:pt-0 text-gray-300">
      <div className="flex flex-col gap-7 md:w-1/2 pt-12 md:pt-0 md:py-12 text-center md:px-12 lg:px-24 justify-center items-center">
        <h1 className="text-5xl font-bold font-serif">Product Store</h1>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptate
          expedita obcaecati ducimus sed labore provident ut, fugit ab qui
          deleniti.
        </p>
        <Link to={"/products"}>
          <motion.button
            className="px-3 py-2 text-gray-900 bg-gray-300 rounded-full font-semibold "
            whileTap={{ scale: 0.8 }}
          >
            Buy Now!!!
          </motion.button>
        </Link>
      </div>
      <div className="lg:w-1/2 md:w-[60%] h-full px-4 lg:px-0 flex items-center justify-center">
        <div className="h-1/2 lg:w-2/3 md:w-full  bg-red-500 rounded-3xl overflow-hidden">
          <Slider images={images} hero={true} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
