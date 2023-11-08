import { Link } from "react-router-dom";
import Slider from "./Slider";

const Card = ({ images, title, price, id, color }) => {
  return (
    <>
      <Slider images={images} />

      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-500">
            <Link to={`/product/${id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {title}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-300">{color}</p>
        </div>
        <p className="text-sm font-medium text-gray-400">{price} ETH</p>
      </div>
    </>
  );
};

export default Card;
