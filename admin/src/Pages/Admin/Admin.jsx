import React from "react";
import "./Admin.css";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { Routes, Route } from "react-router-dom";
import AddProduct from "../../Components/AddProduct/AddProduct";
import ListProduct from "../../Components/ListProduct/ListProduct";
import TotalDue from "../../Components/TotalDue/TotalDue";
import CustomerList from "../../Components/CustomerList/CustomerList";
import AddCoupon from "../../Components/AddCoupon/AddCoupon";
import AddFeeShip from "../../Components/AddFeeShip/AddFeeShip";

const Admin = () => {
  return (
    <div className="admin">
      <Sidebar />
      <Routes>
        <Route path="/" element={<AddProduct />} />
        <Route path="/addproduct" element={<AddProduct />} />
        <Route path="/listproduct" element={<ListProduct />} />
        <Route path="/totaldue" element={<TotalDue />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/addcoupon" element={<AddCoupon />} />
        <Route path="/addfeeship" element={<AddFeeShip />} />
      </Routes>
    </div>
  );
};

export default Admin;
