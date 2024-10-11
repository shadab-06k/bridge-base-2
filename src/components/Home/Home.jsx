import React from "react";
import "./Home.css";
import bridgeImg from "../../assets/Images/bridgeImage1.png";
import cartoonImg from "../../assets/Images/cartoon1.png";
import { MdKeyboardArrowRight } from "react-icons/md";
import circle from "../../assets/Images/circle.png";
import eth from "../../assets/Images/eth.png";
import { useNavigate } from "react-router-dom";
import { BiLogoDiscord } from "react-icons/bi";
import { BsTwitter } from "react-icons/bs";
import { BsGithub } from "react-icons/bs";
import { FaMedium } from "react-icons/fa6";

import img from "../../assets/Images/brimg.png";
const Home = () => {
  const navigate = useNavigate();
  const handleOnLaunchClick = () => {
    navigate("/swap");
  };
  return (
    <>
      <div className="home-main-container">
        <div className="bridge-base-conatainer">
          <h1 className="bridge-base-heading">Click to Launch</h1>
          <button
            className="launch-btn"
            type="button"
            onClick={handleOnLaunchClick}
          >
            Launch
            <MdKeyboardArrowRight className="icon" />
          </button>
        </div>

        <img className="cartoonImg" src={img} alt="Cartoon" loading="lazy" />
        <div className="d-flex flex-row icons-container">
          <BiLogoDiscord className="icons" />
          <BsTwitter className="icons" />
          <BsGithub className="icons" />
          <FaMedium className="icons" />
        </div>
        <div className="d-flex flex-row faq-container">
          <p className="faq">FAQ</p>
          <p className="faq">Docs</p>
          <p className="faq">Forms</p>
          <p className="faq">Careers</p>
        </div>
      </div>
    </>
  );
};

export default Home;
