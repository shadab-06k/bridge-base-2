import "./App.css";
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Swap from "./components/Swap/Swap";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/swap" element={<Swap/>} />
          {/* <Route path="/connect-wallet" element={<ConnectWallet />} /> */}
        </Routes>
      </BrowserRouter>{" "}
    </div>
  );
}

export default App;
