import React from "react";
import ReactDOM from "react-dom/client";
// import StarRating from "./starRating";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating
      maxRating={5}
      color="red"
      size={45}
      messages={["poor", "bad", "neutral", "happy", "Excellent"]}
      defaultValue={1}
    /> */}
  </React.StrictMode>
);

// root.render(
//   <React.StrictMode>
//     {/* <App /> */}

//     <StarRating maxRating={5} />

//   </React.StrictMode>
// );
