import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import navImg from "../../assets/Images/navbarImage.png";
import { WalletContext } from "../WalletContext/WalletContext";
import { ToastContainer } from "react-toastify";

const Navbar = () => {
  const { address, connectWallet } = useContext(WalletContext);
  const [selectedNetwork, setSelectedNetwork] = useState("ETH");
  console.log("selectedNetwork", selectedNetwork);

  const shortenAddress = (address) => {
    if (!address) return "";
    const firstPart = address.slice(0, 8);
    const lastPart = address.slice(-6);
    return `${firstPart}..${lastPart}`;
  };
  const handleConnectWallet = () => {
    connectWallet(selectedNetwork);
  };
  // const handleConnectWallet = () => {
  //   if (selectedNetwork === "ETH") {
  //     // setSelectedNetwork('ETH')
  //     connectWallet("ETH"); // Call the connectWallet function with the selected network
  //   }
  //   else if (selectedNetwork === "BASE") {
  //     // setSelectedNetwork('BASE')
  //     connectWallet("BASE"); // Call the connectWallet function with the selected network
  //   }
  // };

  return (
    <>
      <ToastContainer />
      <header className="header-main-container">
        <Link to="/">
          <img src={navImg} alt="" loading="lazy" />
        </Link>
        <ul>
          <li>
            <Link to="/">HOME</Link>
          </li>
          <li>
            <Link to="/swap">ABOUT</Link>
          </li>
          <li>
            {" "}
            <Link to="/swap">HOW TO BUY</Link>
          </li>
          <li>
            {" "}
            <Link to="/swap">TEAM</Link>
          </li>
          <li>
            <Link to="/swap">CONTACT US</Link>
          </li>
        </ul>
        <button
          className="connect-wallet-btn"
          disabled={address}
          onClick={handleConnectWallet}
          type="button"
        >
          {address ? shortenAddress(address) : "Connect Your Wallet"}
        </button>
      </header>
    </>
  );
};

export default Navbar;
