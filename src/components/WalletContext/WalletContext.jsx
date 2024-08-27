import React, { createContext, useState } from "react";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Create the context
const WalletContext = createContext();

const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState("");
//   const [signer, setSigner] = useState(null);
//   console.log("Signer -== ", signer);

  const connectWallet = async (network) => {
    if (window.ethereum) {
      try {
        // Define chain IDs for Ethereum and Base networks
        const networks = {
          ETH: "0x1", // Ethereum Mainnet Chain ID
          BASE: "0x2105", // Base Network Chain ID (example, replace with actual Base network chain ID)
        };

        const chainId = networks[network];
        // const chainId = networks[network.toUpperCase()]; // Ensure network is matched case-insensitively

        console.log("networks === ", networks);
        console.log("network === ", network);
        console.log("chainId ===", chainId);
        if (!chainId) {
          throw new Error(`Unsupported network: ${network}`);
        }

        // Attempt to switch the network first
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }],
          });
          console.log(`Successfully switched to the ${network} Network`);

          // Now proceed with wallet connection after successful network switch
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
        //   const provider = new ethers.providers.Web3Provider(window.ethereum);
        //   const signer = provider.getSigner();
        //   //   const data = await signer.getAddress()
        //   //   console.log('data signer adddress ',data)
        //   setSigner(signer);

          const walletAddress = accounts[0];

          // Only set the wallet address if everything is successful
          setAddress(walletAddress);
          console.log("Wallet Address:", walletAddress);
          toast.success("Wallet Connected", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
          });
          
        //   let hop = new Hop("mainnet");
        //   hop = await hop.connect(signer);
        //   const bridge = hop.bridge("ETH");
        //   const amountToBridge = ethers.utils.parseUnits("0.01", 18);
        //   const availableLiquidity = await bridge.getSendData(
        //     amountToBridge,
        //     // sourceNetwork,
        //     // destinationNetwork
        //   );
        //   console.log("availableLiquidity ->", availableLiquidity);
        //   console.log("amounts out ->", availableLiquidity.amountOut);
        //   const x = await ethers.BigNumber.from(availableLiquidity.amountOut);
        //   console.log('data == ',x.toString());

          // Call your backend API here if needed
          // const signupSuccess = await userSignup(walletAddress);
          // if (!signupSuccess) {
          //   console.error("Failed to connect to the backend. Wallet not connected.");
          //   return;
          // }
        } catch (switchError) {
          // Handle the network switch error
          if (switchError.code === 4902) {
            console.error(`${network} Network is not present in your wallet.`);
            alert(
              `${network} Network is not added to your wallet. Please add it manually.`
            );
          } else {
            console.error(
              `Failed to switch to ${network} Network:`,
              switchError
            );
          }
          // Throw an error to indicate that the wallet connection cannot proceed
          throw new Error(`Unable to switch network. Wallet not connected.`);
        }
      } catch (connectError) {
        console.error(
          "User denied account access or network switch failed:",
          connectError
        );
      }
    } else {
      alert("MetaMask not detected");
      console.error("MetaMask not detected");
    }
  };

  return (
    <WalletContext.Provider value={{ address, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
export { WalletContext, WalletProvider };
