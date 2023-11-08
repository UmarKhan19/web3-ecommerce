import axios from "axios";
import { useLocation } from "react-router-dom";
import { Rating, Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import contractAbi from "../utils/contractabi.json";
import { useState } from "react";
import { ethers } from "ethers";

export default function SingleProduct() {
  const location = useLocation();
  const [userWallet, setUserWallet] = useState(null);
  const [contract, setContract] = useState(null);

  const fetchData = async () => {
    const id = location.pathname.match(/\/product\/([\w\d]+)$/)[1];
    const { data } = await axios.get(`http://localhost:5000/api/product/${id}`);
    return data.product;
  };

  const {
    isLoading,
    error,
    data: product,
  } = useQuery({ queryKey: ["product"], queryFn: fetchData });

  const connectWalletHandler = async () => {
    if (window.ethereum) {
      await window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(async (result) => {
          await accountChangeHandler(result[0]);

          toast.success("wallet connected");
        });
    } else {
      toast.error("Install Metamask");
    }
  };

  const accountChangeHandler = async (newAccount) => {
    setUserWallet(newAccount);
    await updateEthers();
  };

  const updateEthers = async () => {
    let tempProvider = new ethers.BrowserProvider(window.ethereum);

    let tempSigner = await tempProvider.getSigner();

    let tempContract = new ethers.Contract(
      import.meta.env.VITE_CONTRACT_ADDRESS,
      contractAbi,
      tempSigner
    );
    setContract(tempContract);
  };

  const hula = async () => {
    await contract.payOrder(2000000000000000, {
      value: 2000000000000000,
    });

    buy();
  };

  const buyMutation = useMutation(
    (requestData) => {
      // Perform the actual request using axios
      return axios.post("http://localhost:5000/api/order/create", requestData, {
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTI3YzJmZDc0ZjRjNWE4OTk3ZmE2YjIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2OTcxMzY5MTIsImV4cCI6MTY5Nzc0MTcxMn0.3Kxo2wjavccpLbjX1wWWDXgufgPEgHcMKr2ZBh71osg", // Replace with your actual access token
        },
      });
    },
    {
      // Define onSuccess and onError callbacks if needed
      onSuccess: () => {
        // Handle successful response here
        toast.success("Order Placed Successfully");
      },
      onError: () => {
        // Handle error here
        toast.error("There was some problem in processing the order");
      },
    }
  );

  const buy = async () => {
    const order = {
      address: {
        streetAddress: "GBM apartments, 662, block-c",
        city: "Mohali",
        state: "Punjab",
        country: "India",
        pincode: "140301",
      },
      phoneNumber: "9166484687",
      orderItems: [
        {
          variant: product.variants[0]._id,
          quantity: 1,
        },
      ],
      couponId: "",
    };

    buyMutation.mutate(order);
  };

  if (error) {
    return <div className="pt-16 text-gray-300">Error</div>;
  }

  if (isLoading) {
    return (
      <div className="text-gray-200 lg:pt-8 pt-16 lg:px-20 px-10 flex flex-col  w-full">
        <div className="lg:grid lg:grid-cols-2 flex flex-col  lg:gap-44 w-full h-screen justify-center items-center">
          <div className="h-full w-full">
            <Skeleton sx={{ backgroundColor: "#2e3135", height: "100%" }} />
          </div>
          \{" "}
          <div className="flex flex-col gap-4">
            <Skeleton
              height={30}
              width={400}
              sx={{ backgroundColor: "#2e3135" }}
            />
            <Skeleton
              height={30}
              width={400}
              sx={{ backgroundColor: "#2e3135" }}
            />
            <Skeleton
              height={30}
              width={400}
              sx={{ backgroundColor: "#2e3135" }}
            />
            <Skeleton
              height={30}
              width={400}
              sx={{ backgroundColor: "#2e3135" }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="text-gray-200 pt-16 flex flex-col  w-full">
        <div className="lg:grid lg:grid-cols-2 flex flex-col gap-4 w-full h-screen justify-center items-center">
          <img
            src={product.variants[0].images[0]}
            alt="product"
            className="w-5/6 aspect-square object-cover object-center m-10 rounded-lg "
          />

          <div className="flex flex-col gap-6 w-full h-2/3 p-10 ">
            <h3 className="text-lg font-serif font-semibold">{product.name}</h3>
            <p>{product.description}</p>
            <div className="w-fit h-fit bg-gray-200 flex p-2 rounded-xl">
              <Rating
                name="half-rating-read"
                value={product.rating}
                defaultValue={5}
                precision={0.5}
                readOnly
              />
            </div>
            <div className="flex gap-4 items-center">
              <span>Price: </span>
              <span className="text-sm">
                <s>{product.variants[0].price}</s>
              </span>
              <span className="text-lg">{product.variants[0].totalPrice}</span>
            </div>
            {userWallet ? (
              <motion.button
                className="px-3 py-2 w-fit text-gray-900 bg-gray-300 rounded-full font-semibold "
                whileTap={{ scale: 0.8 }}
                onClick={hula}
              >
                {buyMutation.isLoading ? "Processing Order" : "Buy Now!!!"}
              </motion.button>
            ) : (
              <motion.button
                className="px-3 py-2 w-fit text-gray-900 bg-gray-300 rounded-full font-semibold "
                whileTap={{ scale: 0.8 }}
                onClick={connectWalletHandler}
              >
                Connect Wallet
              </motion.button>
            )}
          </div>
        </div>
      </div>
      <div className=" mt-20 w-full text-gray-200 h-auto flex flex-col gap-8 px-8 mb-20">
        <h3 className="text-2xl font-semibold font-serif self-center">
          Reviews
        </h3>
        {product.reviews.length === 0 ? <span>No reviews</span> : <div></div>}
      </div>
    </>
  );
}
