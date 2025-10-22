import React from "react";
import { createRoot } from "react-dom/client";
import "./popup.css";

const Popup: React.FC = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className="popup">
      <h3>Popup Test</h3>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
};

const container = document.getElementById("root");
if (container) createRoot(container).render(<Popup />);
