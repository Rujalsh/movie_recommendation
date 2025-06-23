import { useEffect, useState } from "react";
import "./App.css";

const Card = ({ title }) => {
  const [count, setCount] = useState(0);

  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    console.log(`Card ${title} has been mounted ${hasLiked}`);
  }, [hasLiked]);

  return (
    <div className="card" onClick={() => setCount(count + 1)}>
      <h2>
        {title} <br /> {count}
      </h2>

      <button onClick={() => setHasLiked(!hasLiked)}>
        {hasLiked ? "liked" : "like"}
      </button>
    </div>
  );
};

const App = () => {
  return (
    <div className="card-container">
      <Card title="1" />
      <Card title="2" />
      <Card title="3" />
    </div>
  );
};

export default App;
