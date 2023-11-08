import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [active, setActive] = useState("home");
  const location = useLocation();
  useEffect(() => {
    location.pathname === "/"
      ? setActive("home")
      : setActive(location.pathname.slice(1));
  }, [location.pathname]);
  const tabs = [
    {
      id: "home",
      label: "Home",
    },
    {
      id: "orders",
      label: "Orders",
    },
    {
      id: "products",
      label: "Products",
    },
    {
      id: "contact",
      label: "Contact",
    },
  ];

  return (
    <nav className="select-none z-[999] bg-[#111827] w-full fixed flex justify-between text-gray-100 items-center px-8 py-4">
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="text-3xl font-bold font-serif hover:cursor-pointer"
      >
        <Link to={"/"}>Brand Name</Link>
      </motion.div>
      <ul className="flex w-1/3 justify-between  items-center">
        {tabs.map((tab) => {
          return (
            // <motion.li
            //   whileTap={{ y: 10 }}
            //   key={tab.id}
            //   className={`${
            //     active === tab.id ? "" : "hover:opacity-50"
            //   }   hover:cursor-pointer relative text-gray-100 py-2 px-3 `}
            // >
            // <>
            //   {active === tab.id && (
            //     <motion.div
            //       layoutId="active-pill"
            //       className="absolute bg-gray-300 inset-0"
            //       style={{ borderRadius: 9999 }}
            //       //   transition={{ duration: 0.4 }}
            //     />
            //   )}
            <Link
              key={tab.id}
              to={tab.id === "home" ? "/" : `/${tab.id}`}
              className={`relative z-10 mix-blend-exclusion ${
                active === tab.id ? "" : "hover:opacity-50"
              }   hover:cursor-pointer relative text-gray-100 py-2 px-3`}
            >
              {tab.label}
            </Link>
            // </>
            // </motion.li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;
