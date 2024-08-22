import React from "react";
import "./Home.css";
import bridgeImg from "../../assets/Images/bridgeImage1.png";
import cartoonImg from "../../assets/Images/cartoon1.png";
import { MdKeyboardArrowRight } from "react-icons/md";
import circle from "../../assets/Images/circle.png";
import eth from "../../assets/Images/eth.png";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const handleOnLaunchClick = () => {
    navigate("/swap");
  };
  return (
    <>
      <div className="home-main-container">
        <div className="bridge-base-conatainer">
          <h2 className="bridge-base-heading">Bridge BASE</h2>
          <button
            className="launch-btn"
            type="button"
            onClick={handleOnLaunchClick}
          >
            Launch
            <MdKeyboardArrowRight className="icon" />
          </button>
        </div>

        <img
          className="cartoonImg"
          src={cartoonImg}
          alt="Cartoon"
          loading="lazy"
        />

        <img
          className="bridgeImg"
          src={bridgeImg}
          alt="Bridge"
          loading="lazy"
        />
      </div>
      <div className="animate-img-container">
        <img className="circle" src={circle} alt="" loading="lazy" />
        <img className="eth" src={eth} alt="" loading="lazy" />
      </div>
    </>
  );
};

export default Home;

// import React from "react";
// import "./Home.css";
// import bridgeImg from "../../assets/Images/bridgeImage1.png";
// import cartoonImg from "../../assets/Images/cartoon1.png";
// import { MdKeyboardArrowRight } from "react-icons/md";

// const Home = () => {
//   return (
//     <>
//       <div className="home-main-container">
//         <h2 className="bridge-base-heading">Bridge BASE</h2>
//         <button
//           className="launch-btn"
//           //   onClick={handleConnectWallet}
//           type="button"
//         >
//           Launch
//           <MdKeyboardArrowRight className="icon" />
//           <div className="cartoon-conatiner">
//             <img
//               className="cartoonImg"
//               src={cartoonImg}
//               alt=""
//               loading="lazy"
//             />
//           </div>
//         </button>
//         <img className="bridgeImg" src={bridgeImg} alt="" loading="lazy" />
//       </div>
//     </>
//   );
// };

// export default Home;
