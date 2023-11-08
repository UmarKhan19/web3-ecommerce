import { useCallback, useEffect } from "react";
import { useState } from "react";

const Slider = ({ images, hero }) => {
  const [imageIndex, setImageIndex] = useState(0);

  const showNextImage = useCallback(() => {
    setImageIndex((prev) => {
      if (prev === images.length - 1) return 0;
      return prev + 1;
    });
  }, [images.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      showNextImage();
    }, 2000); // Change image every 2 seconds (2000 milliseconds)

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [showNextImage]);

  return (
    <div
      className={`aspect-h-1 aspect-w-1 w-full overflow-hidden  rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 ${
        hero ? "h-full" : "h-80"
      }`}
    >
      <img
        src={images[imageIndex]}
        alt={"product"}
        className="h-full w-full object-cover object-top"
      />
    </div>
  );
};

export default Slider;
