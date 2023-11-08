import Card from "./Card";

export default function ProductsGRid({ products }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
      {products.length > 0
        ? products.map((product) => (
            <div key={product._id} className="group relative">
              <Card
                images={product.variants[0].images}
                title={product.name}
                price={product.variants[0].totalPrice}
                id={product._id}
                color={product.variants[0].color}
              />
            </div>
          ))
        : null}
    </div>
  );
}
