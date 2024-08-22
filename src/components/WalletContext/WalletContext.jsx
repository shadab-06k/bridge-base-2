import React, { createContext, useState } from "react";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { ethers } from 'ethers';

// Create the context
const WalletContext = createContext();

const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState("");
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

        console.log('networks === ',networks)
        console.log('network === ',network)
        console.log('chainId ===',chainId)
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
          const walletAddress = accounts[0];
  
          // Only set the wallet address if everything is successful
          setAddress(walletAddress);
          console.log("Wallet Address:", walletAddress);
  
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
            console.error(`Failed to switch to ${network} Network:`, switchError);
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
  
  
//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         await window.ethereum.request({ method: "eth_requestAccounts" });
//         const accounts = await window.ethereum.request({
//           method: "eth_accounts",
//         });
//         const walletAddress = accounts[0];

//         // // Attempt to connect to the backend API
//         // const signupSuccess = await userSignup(walletAddress);
//         // if (!signupSuccess) {
//         //   // Exit the function if the API call fails
//         //   console.error(
//         //     "Failed to connect to the backend. Wallet not connected."
//         //   );
//         //   return;
//         // }

//         // Only set the wallet address if the API call is successful
//         setAddress(walletAddress);
//         console.log("Wallet Address:", walletAddress);

//         const baseChainId = "0x1"; // Hexadecimal representation of 84532
//         try {
//           await window.ethereum.request({
//             method: "wallet_switchEthereumChain",
//             params: [{ chainId: baseChainId }],
//           });
//           console.log("Successfully switched to the Base Network");
//         } catch (switchError) {
//           if (switchError.code === 4902) {
//             console.error("Base Network is not present in your wallet.");
//             alert(
//               "Base Network is not added to your wallet. Please add it manually."
//             );
//           } else {
//             console.error("Failed to switch to Base Network:", switchError);
//           }
//         }
//       } catch (connectError) {
//         console.error("User denied account access:", connectError);
//       }
//     } else {
//       alert("MetaMask not detected");
//       console.error("MetaMask not detected");
//     }
//   };
//   const connectWallet = async (desiredNetwork) => {
//     if (
//       typeof window !== "undefined" &&
//       typeof window.ethereum !== "undefined"
//     ) {
//       try {
//         const accounts = await window.ethereum.request({
//           method: "eth_requestAccounts",
          
//         });
//         const userAddress = accounts[0];
//         setAddress(userAddress);

//         // Check and switch network
//         const chainId = await window.ethereum.request({ method: "eth_chainId" });

//         const networks = {
//           ETH: "0x1", // Ethereum Mainnet chain ID
//           BASE: "0x2105", // Base Mainnet chain ID
//         };

//         if (chainId !== networks[desiredNetwork]) {
//           try {
//             await window.ethereum.request({
//               method: "wallet_switchEthereumChain",
//               params: [{ chainId: networks[desiredNetwork] }],
//             });
//             toast.success(`Switched to ${desiredNetwork} network`, {
//               position: "top-right",
//               autoClose: 3000,
//               hideProgressBar: false,
//               closeOnClick: true,
//               pauseOnHover: false,
//               draggable: true,
//               progress: undefined,
//               theme: "dark",
//               transition: Bounce,
//             });
//           } catch (switchError) {
//             console.error("Failed to switch network", switchError);
//             if (switchError.code === 4902) {
//               toast.error("Network not found in MetaMask", {
//                 position: "top-right",
//                 autoClose: 3000,
//                 hideProgressBar: false,
//                 closeOnClick: true,
//                 pauseOnHover: false,
//                 draggable: true,
//                 progress: undefined,
//                 theme: "dark",
//                 transition: Bounce,
//               });
//             }
//           }
//         }

//         toast.success("Wallet Connected", {
//           position: "top-right",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: false,
//           draggable: true,
//           progress: undefined,
//           theme: "dark",
//           transition: Bounce,
//         });
//       } catch (err) {
//         console.error(err.message);
//         toast.error("Failed to connect wallet");
//       }
//     } else {
//       console.log("Please install MetaMask");
//       toast.warn("Please install MetaMask");
//     }
//   };

//   // Function to connect wallet and fetch balance
//   const connectWallet = async () => {
//     if (
//       typeof window !== "undefined" &&
//       typeof window.ethereum !== "undefined"
//     ) {
//       try {
//         const accounts = await window.ethereum.request({
//           method: "eth_requestAccounts",
//         });
//         const userAddress = accounts[0];
//         console.log("Connected Address:", userAddress);
//         setAddress(userAddress);

//         toast.success("Wallet Connected", {
//           position: "top-right",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: false,
//           draggable: true,
//           progress: undefined,
//           theme: "dark",
//           transition: Bounce,
//         });
//       } catch (err) {
//         console.error(err.message);
//         toast.error("Failed to connect wallet");
//       }
//     } else {
//       console.log("Please install MetaMask");
//       toast.warn("Please install MetaMask");
//     }
//   };

  return (
    <WalletContext.Provider value={{ address, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};
export { WalletContext, WalletProvider };
