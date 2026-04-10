import React, { useState, useEffect } from "react";
import "./TotalDue.css"; // File CSS cho component này

const TotalDue = () => {
  // State để lưu trữ dữ liệu tài chính tổng hợp
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    monthlySummary: [], // Dữ liệu doanh thu/lợi nhuận theo tháng
  });

  // State để theo dõi trạng thái tải dữ liệu
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      // Cần tạo API backend này (xem mục 2)
      const response = await fetch("http://localhost:4000/financialdata");
      const data = await response.json();

      setFinancialData(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu tài chính:", error);
      alert("Không thể tải dữ liệu tài chính.");
      setFinancialData({ totalRevenue: 0, totalProfit: 0, monthlySummary: [] });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  if (isLoading) {
    return <div className="total-due-container">Đang tải dữ liệu tài chính...</div>;
  }

  return (
    <div className="total-due-container">
      <h1>Tổng Hợp Báo Cáo Tài Chính</h1>

      {/* Khối chỉ số chính */}
      <div className="summary-cards">
        <div className="card total-revenue">
          <h2>Tổng Doanh Thu</h2>
          <p>{financialData.totalRevenue.toLocaleString()}đ</p>
        </div>
        <div className="card total-profit">
          <h2>Tổng Lợi Nhuận</h2>
          <p>{financialData.totalProfit.toLocaleString()}đ</p>
        </div>
      </div>

      {/* Bảng Doanh thu theo tháng */}
      <div className="monthly-breakdown">
        <h2>Doanh Thu & Lợi Nhuận Theo Tháng</h2>
        <table>
          <thead>
            <tr>
              <th>Tháng</th>
              <th>Doanh Thu (đ)</th>
              <th>Lợi Nhuận (đ)</th>
            </tr>
          </thead>
          <tbody>
            {financialData.monthlySummary.map((monthData, index) => (
              <tr key={index}>
                <td>
                  {monthData.month} / {monthData.year}
                </td>
                <td>{monthData.revenue.toLocaleString()}</td>
                <td>{monthData.profit.toLocaleString()}</td>
              </tr>
            ))}
            {financialData.monthlySummary.length === 0 && (
              <tr>
                <td colSpan="3">Chưa có dữ liệu giao dịch.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TotalDue;
