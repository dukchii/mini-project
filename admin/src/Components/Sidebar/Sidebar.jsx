import React from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";
import addProductIcon from "../../assets/Product_Cart.svg";
import listProductIcon from "../../assets/Product_list_icon.svg";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link to="/addproduct" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={addProductIcon} alt="" />
          <p>Thêm Sản Phẩm</p>
        </div>
      </Link>
      <Link to="/listproduct" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={listProductIcon} alt="" />
          <p>Danh Mục Sản Phẩm</p>
        </div>
      </Link>
      <Link to="/totaldue" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={listProductIcon} alt="" />
          <p>Tổng Doanh Thu</p>
        </div>
      </Link>
      <Link to="/customers" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={listProductIcon} alt="" />
          <p>Danh Sách Khách Hàng</p>
        </div>
      </Link>
      <Link to="/addcoupon" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={listProductIcon} alt="" />
          <p>Tạo Mã Giảm Giá</p>
        </div>
      </Link>
      <Link to="/addfeeship" style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={listProductIcon} alt="" />
          <p>Tạo Phí Vận Chuyển</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
