import React, { useContext, useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import bitImg from "../../assets/Images/Bitcoin.png";
import ethImg from "../../assets/Images/Ethereum.png";
import swap from "../../assets/Images/swapIcon.png";
import baseImg from "../../assets/Images/circle.png";
import { LuPencil } from "react-icons/lu";
import "./Swap.css";
import { WalletContext } from "../WalletContext/WalletContext";
import { toast } from "react-toastify";

const Swap = () => {
  const { address, connectWallet } = useContext(WalletContext);
  const [selectedOption, setSelectedOption] = useState("BTC");
  const [selectedOptionfrom, setSelectedOptionfrom] = useState("ETH");
  const [selectedOptionTo, setSelectedOptionTo] = useState("BSC");
  const [currentChainId, setCurrentChainId] = useState("");

  useEffect(() => {
    // Function to fetch the current chain ID
    const fetchChainId = async () => {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        setCurrentChainId(chainId);
      }
    };

    fetchChainId();

    // Listen for network changes
    window.ethereum?.on("chainChanged", fetchChainId);

    return () => {
      window.ethereum?.removeListener("chainChanged", fetchChainId);
    };
  }, []);

  const chainParams = {
    ETH: "0x1", // Ethereum Mainnet chain ID
    BSC: "0x2105", // Base chain ID (example, replace with actual ID)
  };

  // Handle network switching when the user selects a network from the dropdown
  const handleNetworkSwitch = async (network) => {
    if (!window.ethereum) {
      toast.error("MetaMask not detected");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainParams[network] }],
      });
      toast.success(`Switched to ${network} network`);
      setCurrentChainId(chainParams[network]);
    } catch (error) {
      if (error.code === 4902) {
        toast.error(`${network} network is not added to your wallet`);
      } else if (error.code === 4001) {
        // User rejected the request
        toast.error("Network switch canceled by user");
        revertToCurrentNetwork();
      } else {
        toast.error(`Failed to switch to ${network} network`);
        revertToCurrentNetwork();
      }
    }
  };

  const revertToCurrentNetwork = () => {
    // Revert dropdown selection to the currently connected network
    const connectedNetwork = Object.keys(chainParams).find(
      (key) => chainParams[key] === currentChainId
    );
    setSelectedOptionfrom(connectedNetwork || "ETH");
  };

  // Connect wallet and switch network if necessary after the wallet is connected
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast.success("Wallet Connected");
    } catch (error) {
      toast.error("Failed to connect wallet");
    }
  };

  // Trigger network switch only after the wallet is connected
  const handleSelectChangefrom = async (event) => {
    const selectedNetwork = event.target.value;
    setSelectedOptionfrom(selectedNetwork);

    if (address) {
      // Only attempt to switch networks if the wallet is connected
      await handleNetworkSwitch(selectedNetwork === "ETH" ? "ETH" : "BSC");
    } else {
      toast.error("Please connect your wallet first");
    }
  };

  useEffect(() => {
    if (selectedOptionfrom === "BSC") {
      setSelectedOptionTo("ETH");
    } else if (selectedOptionfrom === "ETH") {
      setSelectedOptionTo("BSC");
    }
  }, [selectedOptionfrom]);

  useEffect(() => {
    if (selectedOptionTo === "BSC") {
      setSelectedOptionfrom("ETH");
    } else if (selectedOptionTo === "ETH") {
      setSelectedOptionfrom("BSC");
    }
  }, [selectedOptionTo]);

  const getImageForOption = (option) => {
    switch (option) {
      case "BTC":
        return bitImg;
      case "ETH":
        return ethImg;
      case "BSC":
        return baseImg;
      default:
        return null;
    }
  };

  return (
    <div className="swap-main-container">
      <div className="send-heading-conatiner">
        <h2 className="text-white heading">Send</h2>
        <div className="btn-container">
          <button className="btn-send" type="button">
            <img
              className="bitImg"
              src={getImageForOption(selectedOption)}
              alt={selectedOption}
            />
            <select
              className="select-curr"
              name="cryptocurrency"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <option className="BTC" value="BTC">
                BTC
              </option>
              <option className="BTC" value="ETH">
                ETH
              </option>
            </select>
          </button>
        </div>
      </div>
      <div className="main-container">
        <div className="from-main-container">
          <p className="from">From</p>
          <div className="from-below-conatiner">
            <input type="number" placeholder="00.0" className="from-amount" />
            <div className="from-btn-container">
              <button className="from-btn-send" type="button">
                <img
                  className="bitImg"
                  src={getImageForOption(selectedOptionfrom)}
                  alt={selectedOptionfrom}
                />
                <select
                  className="select-curr-from"
                  name="cryptocurrency"
                  value={selectedOptionfrom}
                  onChange={handleSelectChangefrom}
                >
                  <option className="BTC" value="BSC">
                    Base
                  </option>
                  <option className="BTC" value="ETH">
                    Ethereum
                  </option>
                </select>
              </button>
            </div>
          </div>
        </div>
        <div className="swap-icon-container">
          <img className="swap-icon" src={swap} alt="" />
        </div>
        <div className="mx-3 to-main-container">
          <p className="to">TO(estimated)</p>
          <div className="to-below-conatiner">
            <input type="number" placeholder="00.0" className="to-amount" />
            <div className="to-btn-container">
              <button className="to-btn-send" type="button">
                <img
                  className="ethImg"
                  src={getImageForOption(selectedOptionTo)}
                  alt={selectedOptionTo}
                />
                <select
                  className="select-curr-to"
                  name="cryptocurrency"
                  value={selectedOptionTo}
                  onChange={(e) => setSelectedOptionTo(e.target.value)}
                >
                  <option className="BTC" value="BSC">
                    Base
                  </option>
                  <option className="BTC" value="ETH">
                    Ethereum
                  </option>
                </select>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container slippage-container">
        <p className="slippage-heading">Slippage tolerance</p>
        <LuPencil className="text-white" />
      </div>
      <div className="conect-wallet-btn-below">
        <button
          className="connect-wallet-btn-swap"
          onClick={handleConnectWallet}
          disabled={address}
          type="button"
        >
          {address ? "Wallet Connected" : "Connect Your Wallet"}
        </button>
      </div>
    </div>
  );
};

export default Swap;
