import React, { useState, useEffect } from "react";
import "./AddCoupon.css";

const API_BASE_URL = "http://localhost:4000";

const AddCoupon = () => {
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderAmount: 0,
    usageLimit: -1, // -1 là không giới hạn
    expiryDate: "",
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastAddedCoupon, setLastAddedCoupon] = useState(null);

  // ✨ STATE MỚI: Danh sách tất cả mã giảm giá
  const [coupons, setCoupons] = useState([]);
  // ✨ STATE MỚI: Tải danh sách
  const [listLoading, setListLoading] = useState(true);

  // --- HÀM HỖ TRỢ ---

  // Hàm format ngày (YYYY-MM-DD) cho trường expiryDate
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    mm = mm < 10 ? "0" + mm : mm;
    dd = dd < 10 ? "0" + dd : dd;

    return `${yyyy}-${mm}-${dd}`;
  };

  // Định dạng ngày tháng cho hiển thị
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Định dạng tiền tệ
  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString("vi-VN") + " VNĐ";
  };

  // --- HÀM FETCH COUPONS ---

  const fetchCoupons = async () => {
    setListLoading(true); // Bắt đầu tải
    try {
      const response = await fetch(`${API_BASE_URL}/allcoupons`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          // 🔴 LOẠI BỎ header "auth-token": token,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setCoupons(data.coupons);
      } else {
        console.error("Lỗi Server khi tải danh sách:", data.errors);
        setCoupons([]);
      }
    } catch (error) {
      console.error("Lỗi kết nối Server:", error);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // --- HÀM THÊM COUPON ---

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    setLastAddedCoupon(null);

    // Lấy token (dù API /addcoupon của bạn chưa dùng, nhưng API /allcoupons cần)
    const token = localStorage.getItem("auth-token");

    // Kiểm tra logic cơ bản
    if (!formData.code || formData.discountValue <= 0 || !formData.expiryDate) {
      setMessage({ type: "error", text: "Vui lòng điền đầy đủ Mã, Giá trị giảm giá và Ngày hết hạn." });
      setLoading(false);
      return;
    }
    if (formData.discountType === "percentage" && formData.discountValue > 100) {
      setMessage({ type: "error", text: "Giá trị giảm giá theo phần trăm không được vượt quá 100%." });
      setLoading(false);
      return;
    }

    // Gọi API để tạo mã giảm giá
    try {
      const response = await fetch(`${API_BASE_URL}/addcoupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          discountValue: Number(formData.discountValue),
          minOrderAmount: Number(formData.minOrderAmount),
          usageLimit: Number(formData.usageLimit),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: `Tạo mã ${data.coupon.code} thành công!` });
        setLastAddedCoupon(data.coupon);

        setCoupons((prevCoupons) => [data.coupon, ...prevCoupons]);

        // Reset form
        setFormData({
          code: "",
          discountType: formData.discountType,
          discountValue: 0,
          minOrderAmount: 0,
          usageLimit: -1,
          expiryDate: "",
        });
      } else {
        setMessage({ type: "error", text: data.errors || "Lỗi không xác định khi tạo mã." });
        setLastAddedCoupon(null);
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      setMessage({ type: "error", text: "Lỗi kết nối Server." });
      setLastAddedCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER COMPONENT ---

  return (
    <div className="add-coupon-container">
      <h2>Tạo Mã Giảm Giá Mới 🚀</h2>
      {message && <p className={`coupon-admin-message msg-${message.type}`}>{message.text}</p>}

      {/* --------------------- FORM TẠO MÃ --------------------- */}
      <form onSubmit={handleAddCoupon} className="coupon-form">
        {/* ... (Giữ nguyên các trường input) ... */}
        {/* 1. Mã Giảm Giá */}
        <div className="form-group">
          <label htmlFor="code">Mã Giảm Giá (CODE):</label>
          <input type="text" name="code" placeholder="VD: KHUYENMAI2024" value={formData.code} onChange={changeHandler} required className="input-code" disabled={loading} />
        </div>
        {/* 2. Loại và Giá Trị Giảm Giá */}
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="discountType">Loại Giảm Giá:</label>
            <select name="discountType" value={formData.discountType} onChange={changeHandler} disabled={loading}>
              <option value="percentage">Phần Trăm (%)</option> <option value="fixed">Giá Trị Cố Định (VNĐ)</option>
            </select>
          </div>

          <div className="form-group half-width">
            <label htmlFor="discountValue">Giá Trị Giảm:</label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={changeHandler}
              min="1"
              max={formData.discountType === "percentage" ? "100" : undefined}
              required
              disabled={loading}
            />
          </div>
        </div>
        {/* 3. Đơn hàng Tối Thiểu và Giới hạn Sử Dụng */}
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="minOrderAmount">Đơn Hàng Tối Thiểu (VNĐ):</label>
            <input type="number" name="minOrderAmount" value={formData.minOrderAmount} onChange={changeHandler} min="0" disabled={loading} />
          </div>

          <div className="form-group half-width">
            <label htmlFor="usageLimit">Giới Hạn Sử Dụng (Lượt):</label>
            <input type="number" name="usageLimit" placeholder="-1 là không giới hạn" value={formData.usageLimit} onChange={changeHandler} min="-1" disabled={loading} />
          </div>
        </div>
        {/* 4. Ngày Hết Hạn */}
        <div className="form-group">
          <label htmlFor="expiryDate">Ngày Hết Hạn:</label>
          <input type="date" name="expiryDate" value={formData.expiryDate} onChange={changeHandler} min={getTodayDate()} required disabled={loading} />
        </div>

        <button type="submit" className="add-coupon-btn" disabled={loading}>
          {loading ? "Đang Xử Lý..." : "Tạo Mã Giảm Giá"}
        </button>
      </form>

      {/* --------------------- HIỂN THỊ MÃ VỪA TẠO (Vẫn giữ nguyên) --------------------- */}
      {lastAddedCoupon && (
        <div className="coupon-summary">
          <h3>Mã Giảm Giá Vừa Tạo Thành Công 🎉</h3>
          <table>
            <tbody>
              <tr>
                <td>**Mã:**</td>
                <td>
                  <strong style={{ color: "#007bff" }}>{lastAddedCoupon.code}</strong>
                </td>
              </tr>
              <tr>
                <td>**Giá Trị:**</td>
                <td>{lastAddedCoupon.discountType === "percentage" ? `${lastAddedCoupon.discountValue}%` : `${formatCurrency(lastAddedCoupon.discountValue)}`}</td>
              </tr>
              <tr>
                <td>**Hết Hạn:**</td>
                <td>{formatDate(lastAddedCoupon.expiryDate)}</td>
              </tr>
              <tr>
                <td>**Giới Hạn:**</td>
                <td>{lastAddedCoupon.usageLimit === -1 ? "Không giới hạn" : `${lastAddedCoupon.usageLimit} lượt`}</td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>*Dữ liệu này được hiển thị ngay sau khi tạo thành công.</p>
        </div>
      )}

      {/* --------------------- DANH SÁCH TẤT CẢ MÃ GIẢM GIÁ --------------------- */}
      <div className="list-coupon-section">
        <h2 style={{ marginTop: "40px" }}>Danh Sách Tất Cả Mã Giảm Giá 📋</h2>
        <button onClick={fetchCoupons} disabled={listLoading} className="add-coupon-btn refresh-btn">
          {listLoading ? "Đang tải..." : "Tải lại danh sách"}
        </button>

        {listLoading && <p>Đang tải dữ liệu...</p>}

        {!listLoading && coupons.length === 0 && <p>Không tìm thấy mã giảm giá nào hoặc lỗi xác thực. Vui lòng kiểm tra đăng nhập Admin.</p>}

        {!listLoading && coupons.length > 0 && (
          <table className="coupon-table">
            <thead>
              <tr>
                <th>Mã CODE</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Lượt SD</th>
                <th>Hết Hạn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                // Kiểm tra trạng thái hết hạn
                const isExpired = new Date(coupon.expiryDate) < new Date();
                const statusText = isExpired ? "HẾT HẠN" : coupon.usageLimit !== -1 && coupon.usedCount >= coupon.usageLimit ? "HẾT LƯỢT" : coupon.isActive ? "Hoạt động" : "Tạm dừng";
                const statusClass = isExpired || (coupon.usageLimit !== -1 && coupon.usedCount >= coupon.usageLimit) ? "status-expired" : "status-active";

                return (
                  <tr key={coupon._id}>
                    <td className="coupon-code-col">
                      <strong>{coupon.code}</strong>
                    </td>
                    <td>{coupon.discountType === "percentage" ? "Phần Trăm (%)" : "Cố Định (VNĐ)"}</td>
                    <td className="discount-value">{coupon.discountType === "percentage" ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}</td>
                    <td>{formatCurrency(coupon.minOrderAmount)}</td>
                    <td>
                      {coupon.usedCount} / {coupon.usageLimit === -1 ? "∞" : coupon.usageLimit}
                    </td>
                    <td>{formatDate(coupon.expiryDate)}</td>
                    <td className={statusClass}>{statusText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AddCoupon;
