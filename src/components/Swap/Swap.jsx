import React, { useContext, useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import bitImg from "../../assets/Images/Bitcoin.png";
import ethImg from "../../assets/Images/Ethereum.png";
import swap from "../../assets/Images/swapIcon.png";
import baseImg from "../../assets/Images/circle.png";
import usdcIcon from "../../assets/Images/usdc.png";
import { LuPencil } from "react-icons/lu";
import "./Swap.css";
import { WalletContext } from "../WalletContext/WalletContext";
import { toast, Bounce } from "react-toastify";
import { Hop } from "@hop-protocol/sdk";
import { ethers } from "ethers";
import { ClipLoader } from "react-spinners";

const Swap = () => {
  const { address, connectWallet } = useContext(WalletContext);
  const [selectedOption, setSelectedOption] = useState("ETH");
  const [selectedOptionfrom, setSelectedOptionfrom] = useState("ETH");
  const [selectedOptionTo, setSelectedOptionTo] = useState("BSC");
  const [currentChainId, setCurrentChainId] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("ETH"); // Default to Ethereum
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [signer, setSigner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    // Function to fetch the current chain ID
    const fetchChainId = async () => {
      if (window.ethereum) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
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
      toast.success(`Switched to ${network} network`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "dark",
        transition: Bounce,
      });
      setCurrentChainId(chainParams[network]);
    } catch (error) {
      handleNetworkError(error, network);
    }
  };

  const handleNetworkError = (error, network) => {
    if (error.code === 4902) {
      toast.error(`${network} network is not added to your wallet`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "dark",
        transition: Bounce,
      });
    } else if (error.code === 4001) {
      toast.error("Network switch canceled by user", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "dark",
        transition: Bounce,
      });
      revertToCurrentNetwork();
    } else {
      toast.error(`Failed to switch to ${network} network`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        theme: "dark",
        transition: Bounce,
      });
      revertToCurrentNetwork();
    }
  };

  const revertToCurrentNetwork = () => {
    const connectedNetwork = Object.keys(chainParams).find(
      (key) => chainParams[key] === currentChainId
    );
    setSelectedOptionfrom(connectedNetwork || "ETH");
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet(selectedNetwork);
      toast.success("Wallet Connected");
    } catch (error) {
      toast.error("Failed to connect wallet");
    }
  };

  const handleSelectChangeFrom = async (event) => {
    const selectedNetwork = event.target.value;
    setSelectedOptionfrom(selectedNetwork);
    setSelectedOptionTo(selectedNetwork === "ETH" ? "BSC" : "ETH");

    if (address && chainParams[selectedNetwork] !== currentChainId) {
      await handleNetworkSwitch(selectedNetwork);
    }
  };

  const handleSelectChangeTo = async (event) => {
    const selectedNetwork = event.target.value;
    setSelectedOptionTo(selectedNetwork);
    setSelectedOptionfrom(selectedNetwork === "ETH" ? "BSC" : "ETH");

    if (
      address &&
      chainParams[selectedNetwork === "ETH" ? "BSC" : "ETH"] !== currentChainId
    ) {
      await handleNetworkSwitch(selectedNetwork === "ETH" ? "BSC" : "ETH");
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
      case "USDC":
        return usdcIcon;
      default:
        return null;
    }
  };

  const handleSelectTokenDropdown = async (e) => {
    setSelectedOption(e.target.value);
  };

  const handleOnFromInputChange = async (e) => {
    const inputAmount = e.target.value.trim();
    setInputValue(inputAmount);
    setOutputValue("");
    setIsCalculating(true);

    if (!inputAmount || inputAmount === "") {
      setOutputValue("");
      setIsCalculating(false);
      return;
    }

    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let signer = provider.getSigner();

    const hopChainSlugs = {
      ETH: { slug: "ethereum", chainId: 1 },
      BSC: { slug: "base", chainId: 8453 },
    };

    const sourceChain = hopChainSlugs[selectedOptionfrom];
    console.log("sourceChain -> ", sourceChain);
    const destinationChain = hopChainSlugs[selectedOptionTo];
    console.log("destinationChain -> ", destinationChain);

    if (!sourceChain || !destinationChain) {
      console.error("Unsupported chain selected for bridging");
      setIsCalculating(false);
      return;
    }

    try {
      const currentNetwork = await provider.getNetwork();

      console.log("Current network:", currentNetwork);

      if (currentNetwork.chainId !== sourceChain.chainId) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: ethers.utils.hexValue(sourceChain.chainId) }],
        });

        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
      }
      console.log(`Switched to ${selectedOptionfrom} network`);

      const hop = new Hop("mainnet");
      await hop.connect(signer);

      const bridge = hop.bridge(selectedOption);
      const amountToBridge = ethers.utils.parseUnits(inputAmount, 18);

      const availableLiquidity = await bridge.getSendData(
        amountToBridge,
        sourceChain.slug,
        destinationChain.slug
      );

      const outputAmount = ethers.BigNumber.from(
        availableLiquidity.amountOut
      ).toString();

      setOutputValue(ethers.utils.formatUnits(outputAmount, 18));
      setIsCalculating(false);
    } catch (error) {
      console.error("Error during bridging operation:", error);
      setIsCalculating(false);
      setOutputValue("");
    }
  };

  useEffect(() => {
    const recalculateOnOptionChange = async () => {
      if (!inputValue) return;

      try {
        setIsCalculating(true);

        let provider = new ethers.providers.Web3Provider(window.ethereum);
        let currentSigner = provider.getSigner();

        console.log("Inside UseEffect Runs");

        const network = await provider.getNetwork();
        const currentChainId = ethers.utils.hexValue(network.chainId);

        console.log(`Current network chainId: ${currentChainId}`);

        const expectedNetworkId =
          selectedOptionfrom === "ETH" ? "0x1" : "0x2105";

        if (currentChainId !== expectedNetworkId) {
          console.warn(
            `Expected network ${expectedNetworkId}, but detected ${currentChainId}`
          );
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: expectedNetworkId }],
          });

          provider = new ethers.providers.Web3Provider(window.ethereum);
          currentSigner = provider.getSigner();
        }

        const hop = new Hop("mainnet");
        await hop.connect(currentSigner);

        const hopChainSlugs = {
          ETH: "ethereum",
          BSC: "base",
        };

        const sourceChain = hopChainSlugs[selectedOptionfrom];
        const destinationChain = hopChainSlugs[selectedOptionTo];

        if (!sourceChain || !destinationChain) {
          throw new Error(
            `Invalid chainSlug. Source: "${sourceChain}", Destination: "${destinationChain}"`
          );
        }

        const bridge = hop.bridge(selectedOption);
        const amountToBridge = ethers.utils.parseUnits(inputValue, 18);

        const availableLiquidity = await bridge.getSendData(
          amountToBridge,
          sourceChain,
          destinationChain
        );

        const outputAmount = ethers.BigNumber.from(
          availableLiquidity.amountOut
        ).toString();
        console.log("Inside UseEffect Runs2");
        setOutputValue(ethers.utils.formatUnits(outputAmount, 18));
      } catch (error) {
        console.error("Error recalculating bridge data:", error);
        setInputValue("");
        setOutputValue("");
      } finally {
        setIsCalculating(false);
      }
    };

    recalculateOnOptionChange();
  }, [inputValue, selectedOption, selectedOptionfrom, selectedOptionTo]);

  console.log("OutputValue == ", outputValue);

  const handleSwap = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const USDC_CONTRACT_ADDRESSES = {
        1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      };

      const network = await provider.getNetwork();
      const networkId = network.chainId;

      console.log("networkId === ", networkId);

      const USDC_CONTRACT_ADDRESS = USDC_CONTRACT_ADDRESSES[networkId];
      if (!USDC_CONTRACT_ADDRESS) {
        alert("Unsupported network for USDC");
        return;
      }
      console.log(`Connected to network: ${networkId}`);

      console.log(`Using USDC contract address: ${USDC_CONTRACT_ADDRESS}`);

      if (!ethers.utils.isAddress(address)) {
        alert("Invalid Ethereum address");
        return;
      }

      const USDC_ABI = [
        "function balanceOf(address owner) view returns (uint256)",
      ];

      const ethBalance = await provider.getBalance(address);

      console.log(
        `User ETH balance: ${ethers.utils.formatEther(
          ethBalance
        )} , ${inputValue}`
      );

      const ethereumBal = Number(ethers.utils.formatEther(ethBalance, 18));
      let usdBalance;
      let decimal;

      if (selectedOption === "USDC") {
        const usdcContract = new ethers.Contract(
          USDC_CONTRACT_ADDRESS,
          USDC_ABI,
          signer
        );

        usdBalance = await usdcContract.balanceOf(address);
        const usdcBal = Number(ethers.utils.formatUnits(usdBalance, 6));

        console.log(
          "usdcBal ->",
          usdcBal,
          Number(usdcBal),
          "input value ->",
          Number(inputValue)
        );

        if (Number(usdcBal) < Number(inputValue)) {
          toast.warn("You do not have enough USDC to proceed with the swap.", {
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
          return;
        }
        decimal = 6;
      }

      if (selectedOption === "ETH") {
        console.log("11111111111111111111111111111111111111");

        console.log(
          "eth Balance ->",
          Number(ethereumBal),
          "  input Value ->",
          Number(inputValue)
        );
        if (Number(ethereumBal) < Number(inputValue)) {
          toast.warn("You do not have enough ETH to cover the gas fees.", {
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
          return;
        }
        decimal = 18;
      }
      console.log("handle swap decimal ->", decimal);

      await performSwap(
        provider,
        signer,
        address,
        decimal,
        USDC_CONTRACT_ADDRESS
      );
    } catch (error) {
      console.error("Error during swap process:", error);
      alert("An error occurred while trying to perform the swap.");
    }
  };

  const performSwap = async (
    provider,
    signer,
    address,
    decimal,
    USDC_CONTRACT_ADDRESS
  ) => {
    try {
      const hop = new Hop("mainnet");
      await hop.connect(signer);

      const hopChainSlugs = {
        ETH: "ethereum",
        BSC: "base",
      };

      const sourceChainSlug = hopChainSlugs[selectedOptionfrom];
      console.log("sourceChainSlug===", sourceChainSlug);
      console.log("selectedOptionfrom == ", sourceChainSlug);
      const destinationChainSlug = hopChainSlugs[selectedOptionTo];

      console.log("selectedOptionTo == ", destinationChainSlug);

      const bridge = hop.bridge(selectedOption);
      console.log("selectedOption PS", selectedOption);

      console.log("iput value ->", inputValue, decimal);

      const amountToBridge = inputValue * 10 ** decimal;

      if (selectedOption === "USDC") {
        let userUSDCBalance = await bridge.getTokenBalance(
          sourceChainSlug,
          address
        );
        userUSDCBalance = Number(userUSDCBalance.toString());

        console.log("userUSDCBalance ->", userUSDCBalance);
        console.log("amountToBridge ->", amountToBridge);

        if (userUSDCBalance < amountToBridge) {
          alert("You do not have enough USDC to proceed with the swap.");
          return;
        }
      }

      const userETHBalance = await provider.getBalance(address);
      if (userETHBalance < 0) {
        alert("You do not have enough ETH to cover the gas fees.");
        return;
      }

      const availableLiquidity = await bridge.getSendData(
        amountToBridge,
        sourceChainSlug,
        destinationChainSlug
      );
      console.log("7777777777777777777777777777");

      if (!availableLiquidity.isLiquidityAvailable) {
        alert("Not enough liquidity available on the destination chain.");
        return;
      }

      console.log(
        "Estimated fees and data for the transfer: ",
        availableLiquidity
      );

      const tx = await bridge.populateSendTx(
        amountToBridge,
        sourceChainSlug,
        destinationChainSlug
      );
      console.log("tx ->", tx);
      let valueInHex = "0x0";
      if (tx.value) {
        valueInHex = ethers.BigNumber.from(tx.value).toHexString();
        if (valueInHex.startsWith("0x0") && valueInHex.length > 3) {
          valueInHex = "0x" + valueInHex.slice(3);
        }
        console.log("Formatted hex value:", valueInHex);
      }
      console.log("Final hex value:", valueInHex);
      if (selectedOption === "USDC") {
        const usdcContract = new ethers.Contract(
          USDC_CONTRACT_ADDRESS,
          [
            "function allowance(address owner, address spender) view returns (uint256)",
            "function approve(address spender, uint256 value) returns (bool)",
          ],
          signer
        );

        const allowance = await usdcContract.allowance(address, tx.to);
        console.log("Allowance:", ethers.utils.formatUnits(allowance, 6));

        if (allowance.lt(amountToBridge)) {
          console.log("Insufficient allowance, approving...");
          const approveTx = await usdcContract.approve(tx.to, amountToBridge);
          await approveTx.wait();
          console.log("Approval successful");
          toast.success(`Approval successful`, {
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
          setIsLoading(true);
        }
      }

      const txParams = {
        from: address,
        to: tx.to,
        value: valueInHex,
        data: tx.data,
        chainId: await window.ethereum.request({ method: "eth_chainId" }),
      };

      console.log("txParams === ", txParams);

      const estimatedGas = await window.ethereum.request({
        method: "eth_estimateGas",
        params: [txParams],
      });

      console.log("Estimated Gas:", estimatedGas);
      txParams.gas = estimatedGas;

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      console.log("Transaction Hash:", txHash);
      const receipt = await provider.waitForTransaction(txHash);

      if (receipt && receipt.status === 1) {
        toast.success(`Transaction success`, {
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
        setIsLoading(false);
        setInputValue("");
        setOutputValue("");
      } else {
        setIsLoading(false);
        toast.error(`Transaction failed`, {
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
      }
    } catch (error) {
      console.error("Error during the swap/bridge process:", error);
      alert("An error occurred while trying to perform the swap/bridge.");
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Selcted Option", selectedOption);

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
              onChange={handleSelectTokenDropdown}
              disabled={!address}
            >
              <option className="BTC" value="USDC">
                USDC
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
            <input
              type="number"
              placeholder="00.0"
              value={inputValue}
              className="from-amount"
              onChange={handleOnFromInputChange}
              disabled={!address}
            />
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
                  onChange={handleSelectChangeFrom}
                  disabled={!address}
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
            <input
              type="text"
              placeholder="00.0"
              className="to-amount"
              value={
                isCalculating ? "Cal..." : inputValue !== "" ? outputValue : ""
              }
              readOnly
              disabled={!address}
            />
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
                  onChange={handleSelectChangeTo}
                  disabled={!address}
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
        {!address ? (
          <button
            className="connect-wallet-btn-swap"
            onClick={handleConnectWallet}
            type="button"
          >
            Connect Your Wallet
          </button>
        ) : (
          <button
            className="connect-wallet-btn-swap"
            onClick={handleSwap}
            disabled={!inputValue || isLoading}
            type="button"
          >
            {isLoading ? <ClipLoader style={{ color: "#fff" }} /> : "Swap"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Swap;

// import React, { useContext, useState, useEffect } from "react";
// import { IoIosArrowDown } from "react-icons/io";
// import bitImg from "../../assets/Images/Bitcoin.png";
// import ethImg from "../../assets/Images/Ethereum.png";
// import swap from "../../assets/Images/swapIcon.png";
// import baseImg from "../../assets/Images/circle.png";
// import usdcIcon from "../../assets/Images/usdc.png";
// import { LuPencil } from "react-icons/lu";
// import "./Swap.css";
// import { WalletContext } from "../WalletContext/WalletContext";
// import { toast, Bounce } from "react-toastify";
// import { Hop } from "@hop-protocol/sdk";
// import { ethers } from "ethers";
// import { ClipLoader } from "react-spinners";

// const Swap = () => {
//   const { address, connectWallet } = useContext(WalletContext);
//   const [selectedOption, setSelectedOption] = useState("ETH");
//   const [selectedOptionfrom, setSelectedOptionfrom] = useState("Eth");
//   //   const [selectedOptionToken, setSelectedOptionToken] = useState("BSC");
//   //   const [selectedOptionfromToken, setSelectedOptionfromToken] = useState("ETH");
//   const [selectedOptionTo, setSelectedOptionTo] = useState("BSC");
//   const [currentChainId, setCurrentChainId] = useState("");
//   const [selectedNetwork, setSelectedNetwork] = useState("ETH"); // Default to Ethereum
//   const [inputValue, setInputValue] = useState("");
//   const [outputValue, setOutputValue] = useState("");
//   const [signer, setSigner] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isCalculating, setIsCalculating] = useState(false);

//   // const [hexValue, setHexValue] = useState("");

//   useEffect(() => {
//     // Function to fetch the current chain ID
//     const fetchChainId = async () => {
//       if (window.ethereum) {
//         const chainId = await window.ethereum.request({
//           method: "eth_chainId",
//         });
//         setCurrentChainId(chainId);
//       }
//     };

//     fetchChainId();

//     // Listen for network changes
//     window.ethereum?.on("chainChanged", fetchChainId);

//     return () => {
//       window.ethereum?.removeListener("chainChanged", fetchChainId);
//     };
//   }, []);

//   const chainParams = {
//     ETH: "0x1", // Ethereum Mainnet chain ID
//     BSC: "0x2105", // Base chain ID (example, replace with actual ID)
//   };

//   // Handle network switching when the user selects a network from the dropdown
//   const handleNetworkSwitch = async (network) => {
//     if (!window.ethereum) {
//       toast.error("MetaMask not detected");
//       return;
//     }

//     try {
//       await window.ethereum.request({
//         method: "wallet_switchEthereumChain",
//         params: [{ chainId: chainParams[network] }],
//       });
//       toast.success(`Switched to ${network} network`, {
//         position: "top-center",
//         autoClose: 3000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: false,
//         draggable: true,
//         progress: undefined,
//         theme: "dark",
//         transition: Bounce,
//       });
//       setCurrentChainId(chainParams[network]);
//     } catch (error) {
//       if (error.code === 4902) {
//         toast.error(`${network} network is not added to your wallet`, {
//           position: "top-center",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: false,
//           draggable: true,
//           progress: undefined,
//           theme: "dark",
//           transition: Bounce,
//         });
//       } else if (error.code === 4001) {
//         // User rejected the request
//         toast.error("Network switch canceled by user", {
//           position: "top-center",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: false,
//           draggable: true,
//           progress: undefined,
//           theme: "dark",
//           transition: Bounce,
//         });
//         revertToCurrentNetwork();
//       } else {
//         toast.error(`Failed to switch to ${network} network`, {
//           position: "top-center",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: false,
//           draggable: true,
//           progress: undefined,
//           theme: "dark",
//           transition: Bounce,
//         });
//         revertToCurrentNetwork();
//       }
//     }
//   };

//   const revertToCurrentNetwork = () => {
//     // Revert dropdown selection to the currently connected network
//     const connectedNetwork = Object.keys(chainParams).find(
//       (key) => chainParams[key] === currentChainId
//     );
//     setSelectedOptionfrom(connectedNetwork || "ETH");
//   };

//   // Connect wallet and switch network if necessary after the wallet is connected
//   const handleConnectWallet = async () => {
//     try {
//       await connectWallet(selectedNetwork);
//       toast.success("Wallet Connected");
//     } catch (error) {
//       toast.error("Failed to connect wallet");
//     }
//   };

//   // Trigger network switch only after the wallet is connected
//   const handleSelectChangeFrom = async (event) => {
//     const selectedNetwork = event.target.value;
//     setSelectedOptionfrom(selectedNetwork);
//     setSelectedOptionTo(selectedNetwork === "ETH" ? "BSC" : "ETH");

//     // Prompt MetaMask to switch network if needed
//     if (address && chainParams[selectedNetwork] !== currentChainId) {
//       await handleNetworkSwitch(selectedNetwork);
//     }
//   };
//   const handleSelectChangeTo = async (event) => {
//     const selectedNetwork = event.target.value;
//     setSelectedOptionTo(selectedNetwork);
//     setSelectedOptionfrom(selectedNetwork === "ETH" ? "BSC" : "ETH");

//     // Prompt MetaMask to switch network if needed
//     if (
//       address &&
//       chainParams[selectedNetwork === "ETH" ? "BSC" : "ETH"] !== currentChainId
//     ) {
//       await handleNetworkSwitch(selectedNetwork === "ETH" ? "BSC" : "ETH");
//     }
//   };

//   useEffect(() => {
//     if (selectedOptionfrom === "BSC") {
//       setSelectedOptionTo("ETH");
//     } else if (selectedOptionfrom === "ETH") {
//       setSelectedOptionTo("BSC");
//     }
//   }, [selectedOptionfrom]);

//   useEffect(() => {
//     if (selectedOptionTo === "BSC") {
//       setSelectedOptionfrom("ETH");
//     } else if (selectedOptionTo === "ETH") {
//       setSelectedOptionfrom("BSC");
//     }
//   }, [selectedOptionTo]);

//   const getImageForOption = (option) => {
//     switch (option) {
//       case "BTC":
//         return bitImg;
//       case "ETH":
//         return ethImg;
//       case "BSC":
//         return baseImg;
//       case "USDC":
//         return usdcIcon;
//       default:
//         return null;
//     }
//   };

//   const handleSelectTokenDropdown = async (e) => {
//     setSelectedOption(e.target.value);
//   };
//   const handleOnFromInputChange = async (e) => {
//     const inputAmount = e.target.value.trim(); // Trim whitespace to avoid incorrect empty checks
//     setInputValue(inputAmount);

//     // Clear the output value on every input change
//     setOutputValue("");

//     setIsCalculating(true);

//     // If the input is empty, clear the output value and stop execution
//     if (!inputAmount || inputAmount === "" ) {
//       setOutputValue("");
//       setIsCalculating(false);

//       return;
//     }

//     // Ensure provider and signer are set up properly
//     let provider = new ethers.providers.Web3Provider(window.ethereum);
//     let signer = provider.getSigner();

//     // Set up valid Hop chain slugs and their respective chainIds
//     const hopChainSlugs = {
//       ETH: { slug: "ethereum", chainId: 1 },
//       BSC: { slug: "base", chainId: 8453 }, // Base Network's Chain ID
//     };

//     const sourceChain = hopChainSlugs[selectedOptionfrom];
//     const destinationChain = hopChainSlugs[selectedOptionTo];

//     // Verify that the user has selected valid networks
//     if (!sourceChain || !destinationChain) {
//       console.error("Unsupported chain selected for bridging");
//       setIsCalculating(false);
//       return;
//     }

//     try {
//       // Check current network connected to MetaMask
//       const currentNetwork = await provider.getNetwork();
//       console.log("Current network:", currentNetwork);

//       // Switch network if the current network doesn't match the sourceChain
//       if (currentNetwork.chainId !== sourceChain.chainId) {
//         await window.ethereum.request({
//           method: "wallet_switchEthereumChain",
//           params: [{ chainId: ethers.utils.hexValue(sourceChain.chainId) }],
//         });

//         // Re-instantiate provider and signer after switching networks
//         provider = new ethers.providers.Web3Provider(window.ethereum);
//         signer = provider.getSigner();

//         console.log(`Switched to ${selectedOptionfrom} network`);
//       }

//       // Re-instantiate Hop SDK after ensuring the correct network
//       const hop = new Hop("mainnet");
//       await hop.connect(signer);

//       // Initialize the correct bridge for the asset you're transferring
//       const bridge = hop.bridge(selectedOption);

//       // Prepare the amount to be bridged
//       const amountToBridge = ethers.utils.parseUnits(inputAmount, 18);

//       // Fetch available liquidity and calculate the output amount
//       const availableLiquidity = await bridge.getSendData(
//         amountToBridge,
//         sourceChain.slug, // Source chain slug
//         destinationChain.slug // Destination chain slug
//       );

//       const outputAmount = ethers.BigNumber.from(
//         availableLiquidity.amountOut
//       ).toString();

//       setOutputValue(ethers.utils.formatUnits(outputAmount, 18));
//       setIsCalculating(false);

//     } catch (error) {
//       console.error("Error during bridging operation:", error);
//       setOutputValue(""); // Clear output in case of error
//       if (error.code === 4902) {
//         alert(
//           "Network is not added to MetaMask. Please add the network manually."
//         );
//       } else if (error.response && error.response.status === 429) {
//         alert("API limit exceeded. Please refresh the page and try again.");
//       } else {
//         alert(
//           "An error occurred during the swap operation. Please check your network settings."
//         );
//       }
//     }
//   };

//   useEffect(() => {
//     const recalculateOnOptionChange = async () => {
//       // Prevent calculations if inputValue is empty or signer is missing
//       if (!inputValue) return;

//       try {

//         setIsCalculating(true);
//         // Get a fresh provider and signer to ensure the latest connection
//         let provider = new ethers.providers.Web3Provider(window.ethereum);
//         let currentSigner = provider.getSigner();

//         console.log('Inside UseEffect Runs')
//         // Fetch the current network chain ID
//         const network = await provider.getNetwork();
//         const currentChainId = ethers.utils.hexValue(network.chainId);

//         console.log(`Current network chainId: ${currentChainId}`);

//         // Determine the expected network ID based on selected source chain
//         const expectedNetworkId =
//           selectedOptionfrom === "ETH" ? "0x1" : "0x2105"; // Adjust based on selectedOptionfrom

//         // If the network is incorrect, switch networks
//         if (currentChainId !== expectedNetworkId) {
//           console.warn(
//             `Expected network ${expectedNetworkId}, but detected ${currentChainId}`
//           );
//           await window.ethereum.request({
//             method: "wallet_switchEthereumChain",
//             params: [{ chainId: expectedNetworkId }],
//           });

//           // After switching, reconnect provider and signer
//           provider = new ethers.providers.Web3Provider(window.ethereum);
//           currentSigner = provider.getSigner();
//         }

//         // Initialize the Hop SDK after network verification
//         const hop = new Hop("mainnet");
//         await hop.connect(currentSigner);

//         // Define the correct chain slugs for the bridge operation
//         const hopChainSlugs = {
//           ETH: "ethereum",
//           BSC: "base",
//         };

//         // Validate selected chains
//         const sourceChain = hopChainSlugs[selectedOptionfrom];
//         const destinationChain = hopChainSlugs[selectedOptionTo];

//         if (!sourceChain || !destinationChain) {
//           throw new Error(
//             `Invalid chainSlug. Source: "${sourceChain}", Destination: "${destinationChain}"`
//           );
//         }

//         // Initialize the bridge
//         const bridge = hop.bridge(selectedOption);
//         const amountToBridge = ethers.utils.parseUnits(inputValue, 18);

//         // Fetch available liquidity and calculate the output amount
//         const availableLiquidity = await bridge.getSendData(
//           amountToBridge,
//           sourceChain,
//           destinationChain
//         );

//         const outputAmount = ethers.BigNumber.from(
//           availableLiquidity.amountOut
//         ).toString();

//         // Update the output value
//         console.log('Inside UseEffect Runs2')
//         setOutputValue(ethers.utils.formatUnits(outputAmount, 18));
//         // setIsCalculating(false)
//       } catch (error) {
//         console.error("Error recalculating bridge data:", error);
//         setOutputValue(""); // Reset output value on error
//         setIsCalculating(false); // Ensure this is here in the catch block
//       }finally {
//         setIsCalculating(false);
//       }
//     };

//     // Trigger recalculation when dependencies change
//     recalculateOnOptionChange();
//   }, [
//     inputValue,
//     selectedOption,
//     selectedOptionfrom,
//     selectedOptionTo,
//   ]);

//   console.log("OutputValue == ", outputValue);

//   const handleSwap = async () => {
//     try {
//       // Check if MetaMask is available
//       if (!window.ethereum) {
//         alert("MetaMask is not installed!");
//         return;
//       }

//       // Get the provider and signer from MetaMask
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();

//       // Define USDC contract addresses for different networks (example for Ethereum and Base)
//       const USDC_CONTRACT_ADDRESSES = {
//         1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum Mainnet USDC
//         8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base Network USDC
//       };

//       // Get the user's connected network
//       const network = await provider.getNetwork();
//       const networkId = network.chainId;
//       console.log("networkId === ", networkId);

//       // Get the USDC contract address for the current network
//       const USDC_CONTRACT_ADDRESS = USDC_CONTRACT_ADDRESSES[networkId];
//       if (!USDC_CONTRACT_ADDRESS) {
//         alert("Unsupported network for USDC");
//         return;
//       }

//       console.log(`Connected to network: ${networkId}`);
//       console.log(`Using USDC contract address: ${USDC_CONTRACT_ADDRESS}`);

//       // Ensure that `address` is a valid Ethereum address
//       if (!ethers.utils.isAddress(address)) {
//         alert("Invalid Ethereum address");
//         return;
//       }

//       // USDC token ABI to interact with the contract
//       const USDC_ABI = [
//         // balanceOf method ABI
//         "function balanceOf(address owner) view returns (uint256)",
//       ];

//       // Get the ETH balance
//       const ethBalance = await provider.getBalance(address);
//       console.log(
//         `User ETH balance: ${ethers.utils.formatEther(
//           ethBalance
//         )} , ${inputValue}`
//       );
//       const ethereumBal = Number(ethers.utils.formatEther(ethBalance, 18));
//       let usdBalance;
//       let decimal;

//       if (selectedOption === "USDC") {
//         // Get the USDC token contract instance using signer (since it involves the user's wallet)
//         const usdcContract = new ethers.Contract(
//           USDC_CONTRACT_ADDRESS,
//           USDC_ABI,
//           signer // Use signer to interact with the contract
//         );

//         // Get the user's USDC balance
//         usdBalance = await usdcContract.balanceOf(address);
//         const usdcBal = Number(ethers.utils.formatUnits(usdBalance, 6));
//         console.log(
//           "usdcBal ->",
//           usdcBal,
//           Number(usdcBal),
//           "input value ->",
//           Number(inputValue)
//         );
//         // Check if the user has enough USDC
//         if (Number(usdcBal) < Number(inputValue)) {
//           toast.warn("You do not have enough USDC to proceed with the swap.", {
//             position: "top-center",
//             autoClose: 3000,
//             hideProgressBar: false,
//             closeOnClick: true,
//             pauseOnHover: false,
//             draggable: true,
//             progress: undefined,
//             theme: "dark",
//             transition: Bounce,
//           });
//           return;
//         }
//         decimal = 6;
//       }

//       if (selectedOption === "ETH") {
//         console.log("11111111111111111111111111111111111111");
//         console.log(
//           "eth Balance ->",
//           Number(ethereumBal),
//           "  input Value ->",
//           Number(inputValue)
//         );

//         if (Number(ethereumBal) < Number(inputValue)) {
//           toast.warn("You do not have enough ETH to cover the gas fees.", {
//             position: "top-center",
//             autoClose: 3000,
//             hideProgressBar: false,
//             closeOnClick: true,
//             pauseOnHover: false,
//             draggable: true,
//             progress: undefined,
//             theme: "dark",
//             transition: Bounce,
//           });
//           return;
//         }
//         decimal = 18;
//       }
//       console.log("handle swap decimal ->", decimal);
//       // If the user has enough tokens, proceed with the swap logic
//       await performSwap(
//         provider,
//         signer,
//         address,
//         decimal,
//         USDC_CONTRACT_ADDRESS
//       );
//     } catch (error) {
//       console.error("Error during swap process:", error);
//       if (error.code === "CALL_EXCEPTION") {
//         alert(
//           "Call to the contract reverted. Please check if you are using the correct contract address and ABI."
//         );
//       } else {
//         alert("An error occurred while trying to perform the swap.");
//       }
//     }
//   };

//   const performSwap = async (
//     provider,
//     signer,
//     address,
//     decimal,
//     USDC_CONTRACT_ADDRESS
//   ) => {
//     try {
//       // Instantiate the Hop SDK
//       const hop = new Hop("mainnet");
//       await hop.connect(signer);
//       const hopChainSlugs = {
//         ETH: "ethereum",
//         BSC: "base",
//       };

//       // Define the source and destination chains
//       const sourceChainSlug = hopChainSlugs[selectedOptionfrom];
//       // console.log('sourceChainSlug===',sourceChainSlug)
//       console.log("selectedOptionfrom == ", sourceChainSlug);

//       const destinationChainSlug = hopChainSlugs[selectedOptionTo];
//       console.log("selectedOptionTo == ", destinationChainSlug);

//       // Initialize the correct bridge for the asset you're transferring (e.g., USDC)
//       const bridge = hop.bridge(selectedOption);
//       console.log("selectedOption PS", selectedOption);

//       // Define the amount to transfer
//       console.log("iput value ->", inputValue, decimal);
//       const amountToBridge = inputValue * 10 ** decimal; // 1 USDC (USDC uses 6 decimal places)

//       // Check if the user has enough balance on the source chain
//       if (selectedOption === "USDC") {
//         let userUSDCBalance = await bridge.getTokenBalance(
//           sourceChainSlug,
//           address
//         );
//         userUSDCBalance = Number(userUSDCBalance.toString());
//         console.log("userUSDCBalance ->", userUSDCBalance);
//         console.log("amountToBridge ->", amountToBridge);

//         if (userUSDCBalance < amountToBridge) {
//           alert("You do not have enough USDC to proceed with the swap222.");
//           return;
//         }
//       }

//       // Check if the user has enough ETH for gas on the source chain
//       const userETHBalance = await provider.getBalance(address);

//       // const minETHRequired = ethers.utils.parseEther("0.01"); // Set your minimum required ETH for gas fees
//       if (userETHBalance < 0) {
//         alert("You do not have enough ETH to cover the gas fees 1111.");
//         return;
//       }

//       console.log("66666666666666666666");

//       // Estimate gas and fees for the transfer
//       const availableLiquidity = await bridge.getSendData(
//         amountToBridge,
//         sourceChainSlug,
//         destinationChainSlug
//       );
//       console.log("7777777777777777777777777777");

//       // Check if liquidity is available
//       if (!availableLiquidity.isLiquidityAvailable) {
//         alert(
//           "Not enough liquidity available on the destination chain for this transfer."
//         );
//         return;
//       }

//       console.log(
//         "Estimated fees and data for the transfer: ",
//         availableLiquidity
//       );

//       const tx = await bridge.populateSendTx(
//         amountToBridge,
//         sourceChainSlug,
//         destinationChainSlug
//       );
//       console.log("tx ->", tx);
//       let valueInHex = "0x0"; // Default value

//       if (tx.value) {
//         // Convert tx.value to BigNumber and then to a properly formatted hex string
//         valueInHex = ethers.BigNumber.from(tx.value).toHexString();

//         // Check if the value has more than one zero after the '0x'
//         if (valueInHex.startsWith("0x0") && valueInHex.length > 3) {
//           valueInHex = "0x" + valueInHex.slice(3);
//         }

//         console.log("Formatted hex value:", valueInHex);
//       }

//       // No need to use setHexValue here, just use valueInHex directly
//       console.log("Final hex value:", valueInHex);

//       if (selectedOption === "USDC") {
//         const tokenContractAddress = USDC_CONTRACT_ADDRESS;
//         // Get the USDC token contractconst
//         const usdcContract = new ethers.Contract(
//           tokenContractAddress,
//           [
//             "function allowance(address owner, address spender) view returns (uint256)",
//             "function approve(address spender, uint256 value) returns (bool)",
//           ],
//           signer
//         );
//         // Check allowance for the sendApprovalAddress
//         const allowance = await usdcContract.allowance(address, tx.to);
//         console.log("Allowance:", ethers.utils.formatUnits(allowance, 6));
//         // If allowance is less than the amount to be bridged, send an approval transaction
//         if (allowance.lt(amountToBridge)) {
//           console.log("Insufficient allowance, approving...");
//           const approveTx = await usdcContract.approve(tx.to, amountToBridge);
//           await approveTx.wait();
//           // Wait for the transaction to be mined
//           console.log("Approval successful");
//           toast.success(`Approval successful`, {
//             position: "top-center",
//             autoClose: 3000,
//             hideProgressBar: false,
//             closeOnClick: true,
//             pauseOnHover: false,
//             draggable: true,
//             progress: undefined,
//             theme: "dark",
//             transition: Bounce,
//           });
//           setIsLoading(true);
//         } else {
//           console.log("Sufficient allowance, no need to approve");
//         }
//       }

//       const chainId = await window.ethereum.request({ method: "eth_chainId" });

//       let txParams = {
//         from: address,
//         to: tx.to, // Replace with the recipient's address (tx.to)
//         value: valueInHex, // Value in wei (tx.value), example: 0.01 ETH
//         data: tx.data,
//         chainId: chainId,
//       };

//       console.log("txParams === ", txParams);
//       // Estimate gas
//       const estimatedGas = await window.ethereum.request({
//         method: "eth_estimateGas",
//         params: [txParams],
//       });
//       console.log("Estimated Gas:", estimatedGas);
//       // Add gas to the transaction parameters
//       txParams.gas = estimatedGas;
//       // Send the transaction using MetaMask
//       const txHash = await window.ethereum.request({
//         method: "eth_sendTransaction",
//         params: [txParams],
//       });
//       console.log("Transaction Hash:", txHash);
//       const receipt = await provider.waitForTransaction(txHash);
//       if (receipt && receipt.status === 1) {
//         toast.success(`Transaction completed`, {
// position: "top-center",
// autoClose: 3000,
// hideProgressBar: false,
// closeOnClick: true,
// pauseOnHover: false,
// draggable: true,
// progress: undefined,
// theme: "dark",
// transition: Bounce,
//         });
// setIsLoading(false);
// setInputValue("");
// setOutputValue("");
//       } else {
//         console.error("Transaction failed:", receipt);
//         setIsLoading(false);
//         toast.error(`Transaction failed`, {
// position: "top-center",
// autoClose: 3000,
// hideProgressBar: false,
// closeOnClick: true,
// pauseOnHover: false,
// draggable: true,
// progress: undefined,
// theme: "dark",
// transition: Bounce,
//         });
//       }
//     } catch (error) {
//       console.error("Error during the swap/bridge process:", error);
//       alert("An error occurred while trying to perform the swap/bridge.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   console.log("Selcted Option", selectedOption);

//   return (
//     <div className="swap-main-container">
//       <div className="send-heading-conatiner">
//         <h2 className="text-white heading">Send</h2>
//         <div className="btn-container">
//           <button className="btn-send" type="button">
//             <img
//               className="bitImg"
//               src={getImageForOption(selectedOption)}
//               alt={selectedOption}
//             />
//             <select
//               className="select-curr"
//               name="cryptocurrency"
//               value={selectedOption}
//               onChange={handleSelectTokenDropdown}
//               //   onChange={(e) => setSelectedOption(e.target.value)}
//               disabled={!address}
//             >
//               <option className="BTC" value="USDC">
//                 USDC
//               </option>
//               <option className="BTC" value="ETH">
//                 ETH
//               </option>
//             </select>
//           </button>
//         </div>
//       </div>
//       <div className="main-container">
//         <div className="from-main-container">
//           <p className="from">From</p>
//           <div className="from-below-conatiner">
//             <input
//               type="number"
//               placeholder="00.0"
//               value={inputValue}
//               className="from-amount"
//               onChange={handleOnFromInputChange}
//               disabled={!address}
//             />
//             <div className="from-btn-container">
//               <button className="from-btn-send" type="button">
//                 <img
//                   className="bitImg"
//                   src={getImageForOption(selectedOptionfrom)}
//                   alt={selectedOptionfrom}
//                 />
//                 <select
//                   className="select-curr-from"
//                   name="cryptocurrency"
//                   value={selectedOptionfrom}
//                   onChange={handleSelectChangeFrom}
//                   disabled={!address}
//                 >
//                   <option className="BTC" value="BSC">
//                     Base
//                   </option>
//                   <option className="BTC" value="ETH">
//                     Ethereum
//                   </option>
//                 </select>
//               </button>
//             </div>
//           </div>
//         </div>
//         <div className="swap-icon-container">
//           <img className="swap-icon" src={swap} alt="" />
//         </div>
//         <div className="mx-3 to-main-container">
//           <p className="to">TO(estimated)</p>
//           <div className="to-below-conatiner">
//             <input
//               type="number"
//               placeholder="00.0"
//               className="to-amount"
//               // value={inputValue !== "" ? outputValue : ""} // Ensure outputValue is always a string
//               // value={inputValue !== "" ? outputValue : ""} // Ensure outputValue is always a string

//               value={
//                 isCalculating
//                   ? "Cal..."
//                   : inputValue !== ""
//                   ? outputValue
//                   : ""
//               }
//               readOnly
//               disabled={!address}
//             />
//             <div className="to-btn-container">
//               <button className="to-btn-send" type="button">
//                 <img
//                   className="ethImg"
//                   src={getImageForOption(selectedOptionTo)}
//                   alt={selectedOptionTo}
//                 />
//                 <select
//                   className="select-curr-to"
//                   name="cryptocurrency"
//                   value={selectedOptionTo}
//                   onChange={handleSelectChangeTo}
//                   disabled={!address}
//                   //   value={selectedOptionTo}
//                   // onChange={(e) => setSelectedOptionTo(e.target.value)}
//                 >
//                   <option className="BTC" value="BSC">
//                     Base
//                   </option>
//                   <option className="BTC" value="ETH">
//                     Ethereum
//                   </option>
//                 </select>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//       <div className="container slippage-container">
//         <p className="slippage-heading">Slippage tolerance</p>
//         <LuPencil className="text-white" />
//       </div>
//       <div className="conect-wallet-btn-below">
//         {!address ? (
//           <button
//             className="connect-wallet-btn-swap"
//             onClick={handleConnectWallet}
//             //   disabled={address}
//             type="button"
//           >
//             {/* {address ? "Wallet Connected" : "Connect Your Wallet"} */}
//             Connect Your Wallet
//           </button>
//         ) : (
//           <button
//             className="connect-wallet-btn-swap"
//             onClick={handleSwap}
//             disabled={!inputValue || isLoading}
//             type="button"
//           >
//             {isLoading ? <ClipLoader style={{ color: "#fff" }} /> : "Swap"}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Swap;
