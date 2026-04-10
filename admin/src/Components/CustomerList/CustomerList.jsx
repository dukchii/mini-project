import React, { useEffect, useState } from "react";
import "./CustomerList.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hàm lấy dữ liệu khách hàng từ Backend
    const fetchCustomers = async () => {
      try {
        // Giả định Admin đã đăng nhập và có token nếu cần bảo vệ route này
        // const token = localStorage.getItem("admin-token");

        const response = await fetch("http://localhost:4000/customers");
        const data = await response.json();

        if (data.success) {
          setCustomers(data.customers);
          setError(null);
        } else {
          setError(data.errors || "Lỗi khi tải dữ liệu khách hàng.");
        }
      } catch (err) {
        console.error("Lỗi API/Kết nối:", err);
        setError("Không thể kết nối đến server backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Hàm định dạng ngày tháng (DD/MM/YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Hàm định dạng tiền tệ (Ví dụ: 1000000 => 1.000.000₫)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  if (loading) {
    return <div className="customer-list-container">Đang tải dữ liệu khách hàng...</div>;
  }

  if (error) {
    return <div className="customer-list-container customer-error">Lỗi: {error}</div>;
  }

  return (
    <div className="customer-list">
      <h2>📊 Quản Lý Khách Hàng</h2>
      <hr />

      {customers.length === 0 ? (
        <p>Chưa có dữ liệu khách hàng nào.</p>
      ) : (
        <div className="customer-table-wrapper">
          <table className="customer-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên Khách Hàng</th>
                <th>Email</th>
                <th>Ngày Tạo TK</th>
                <th>Tổng Đơn Hàng</th>
                <th>Sản Phẩm Đã Mua</th>
                <th>Tổng Tiền Đã Chi</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr key={customer.id}>
                  <td>{index + 1}</td>
                  <td className="customer-name">{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{formatDate(customer.createdAt)}</td>
                  <td>{customer.totalOrders}</td>
                  <td>{customer.totalItems}</td>
                  <td className="customer-spent">{formatCurrency(customer.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
