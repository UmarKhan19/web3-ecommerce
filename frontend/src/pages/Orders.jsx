import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@mui/material";

export default function Orders() {
  async function getOrders() {
    const { data } = await axios.get("http://localhost:5000/api/order/my", {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NTI3YzJmZDc0ZjRjNWE4OTk3ZmE2YjIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2OTcxMzY5MTIsImV4cCI6MTY5Nzc0MTcxMn0.3Kxo2wjavccpLbjX1wWWDXgufgPEgHcMKr2ZBh71osg",
      },
    });
    return data.order;
  }

  const {
    isLoading,
    error,
    data: orders,
  } = useQuery({ queryKey: ["orders"], queryFn: getOrders });

  if (error)
    return (
      <div className="pt-20 flex justify-center items-center h-screen text-center text-gray-300">
        <p className="text-2xl font-semibold">Error fetching your orders!!!</p>
      </div>
    );

  if (isLoading)
    return (
      <div className="pt-20 bor px-5 w-full flex flex-col">
        {Array(4)
          .fill()
          .map((_, index) => (
            <div key={index} className="h-[60vh] -mb-20">
              <Skeleton
                sx={{ backgroundColor: "#2e3135", margin: 0, height: "100%" }}
              />
            </div>
          ))}
      </div>
    );

  return (
    <div
      className={`pt-20 text-gray-300 flex flex-col gap-10 px-10 ${
        orders.length === 0 ? "h-screen justify-center items-center" : null
      }`}
    >
      {orders.length === 0 ? (
        <p className="text-2xl font-semibold ">
          Sorry!! Looks like you do not have any orders at the moment
        </p>
      ) : (
        orders.map((order) => {
          return (
            <div
              key={order._id}
              className="border-white border-2 rounded-lg p-10 flex flex-col gap-5"
            >
              <h3>
                <span className="bg-gray-300 text-gray-900 p-1 rounded-md">
                  Order Status:
                </span>{" "}
                <span className="p-1 bg-yellow-600 rounded-md font-semibold">
                  {order.orderStatus.toUpperCase()}
                </span>
              </h3>
              {order.orderItems.map((orderItem) => {
                return (
                  <div key={order._id}>
                    <h4>
                      <span className="bg-gray-300 text-gray-900 p-1 rounded-md">
                        Product:
                      </span>{" "}
                      {orderItem.variant.product.name}
                    </h4>
                  </div>
                );
              })}
              <p>
                <span className="bg-gray-300 text-gray-900 p-1 rounded-md">
                  Total Amount:
                </span>{" "}
                {order.totalAmount} ETH
              </p>
              <p>
                <span className="bg-gray-300 text-gray-900 p-1 rounded-md">
                  Phone Number:
                </span>{" "}
                {order.phoneNumber}
              </p>
              <div className="bg-gray-300 rounded-lg p-5 text-gray-900">
                <h4 className="font-bold">Address:</h4>
                <p>Street Address: {order.address.streetAddress}</p>
                <p>City: {order.address.city}</p>
                <p>State: {order.address.state}</p>
                <p>Country: {order.address.country}</p>
                <p>Pincode: {order.address.pincode}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
