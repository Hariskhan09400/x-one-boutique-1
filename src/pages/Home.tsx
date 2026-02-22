import { products } from "../data/products";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6">
      {products.map((product) => (
        <Link key={product.id} to={`/product/${product.id}`}>
          <div className="border rounded-xl p-3 hover:shadow-lg">
            <img src={product.images[0]} />
            <h3>{product.name}</h3>
            <p>₹{product.price}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Home;