import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Swap from "./components/Swap/Swap";
import About from "./components/About/About";
import ContactUs from "./components/ContactUs/ContactUs";
import Buy from "./components/Buy/Buy";
import Team from "./components/Team/Team";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/about" element={<About/>} />
          <Route path="/contact" element={<ContactUs/>} />
          <Route path="/buy" element={<Buy/>} />
          <Route path="/team" element={<Team/>} /> */}
          <Route path="/swap" element={<Swap />} />
          {/* <Route path="/connect-wallet" element={<ConnectWallet />} /> */}
        </Routes>
      </BrowserRouter>{" "}
    </div>
  );
}

export default App;
