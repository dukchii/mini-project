import React, { useState, useEffect } from "react";
import "./AddFeeShip.css";

// DỮ LIỆU TỈNH THÀNH (Dùng cho chức năng Batch Add)
const REMAINING_CITIES_DATA = [
  { city: "Hà Nội", baseFee: 60000, zoneType: "Nội Thành", estimatedDeliveryTime: "6-7 ngày làm việc" },
  { city: "Hồ Chí Minh", baseFee: 10000, zoneType: "Nội Thành", estimatedDeliveryTime: "1 ngày làm việc" },
  { city: "Hải Phòng", baseFee: 20000, zoneType: "Nội Thành", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Đà Nẵng", baseFee: 25000, zoneType: "Nội Thành", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Cần Thơ", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "An Giang", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Bà Rịa - Vũng Tàu", baseFee: 25000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Bắc Giang", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Bắc Kạn", baseFee: 40000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "3-4 ngày làm việc" },
  { city: "Bạc Liêu", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Bắc Ninh", baseFee: 20000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Bến Tre", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Bình Định", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Bình Dương", baseFee: 15000, zoneType: "Nội Thành", estimatedDeliveryTime: "1 ngày làm việc" },
  { city: "Bình Phước", baseFee: 25000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2 ngày làm việc" },
  { city: "Bình Thuận", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Cao Bằng", baseFee: 40000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "3-4 ngày làm việc" },
  { city: "Cà Mau", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "3-4 ngày làm việc" },
  { city: "Đắk Lắk", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Đắk Nông", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Điện Biên", baseFee: 45000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "3-4 ngày làm việc" },
  { city: "Đồng Nai", baseFee: 15000, zoneType: "Nội Thành", estimatedDeliveryTime: "1 ngày làm việc" },
  { city: "Đồng Tháp", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Gia Lai", baseFee: 35000, zoneFee: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Hà Giang", baseFee: 45000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "3-4 ngày làm việc" },
  { city: "Hà Nam", baseFee: 25000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Hà Tĩnh", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Hải Dương", baseFee: 20000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Hậu Giang", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Hòa Bình", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2 ngày làm việc" },
  { city: "Hưng Yên", baseFee: 20000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Khánh Hòa", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Kiên Giang", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Kon Tum", baseFee: 40000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "3-4 ngày làm việc" },
  { city: "Lai Châu", baseFee: 50000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "3-4 ngày làm việc" },
  { city: "Lâm Đồng", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Lạng Sơn", baseFee: 40000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "3-4 ngày làm việc" },
  { city: "Lào Cai", baseFee: 40000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "3-4 ngày làm việc" },
  { city: "Long An", baseFee: 20000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Nam Định", baseFee: 25000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Nghệ An", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Ninh Bình", baseFee: 25000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Ninh Thuận", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Phú Thọ", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2 ngày làm việc" },
  { city: "Phú Yên", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Quảng Bình", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Quảng Nam", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Quảng Ngãi", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Quảng Ninh", baseFee: 25000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Quảng Trị", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Sóc Trăng", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Sơn La", baseFee: 40000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "3-4 ngày làm việc" },
  { city: "Tây Ninh", baseFee: 20000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Thái Bình", baseFee: 20000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Thái Nguyên", baseFee: 25000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2 ngày làm việc" },
  { city: "Thanh Hóa", baseFee: 25000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Thừa Thiên Huế", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Tiền Giang", baseFee: 25000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Trà Vinh", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Tuyên Quang", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Vĩnh Long", baseFee: 30000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "Vĩnh Phúc", baseFee: 20000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "1-2 ngày làm việc" },
  { city: "Yên Bái", baseFee: 35000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "2-3 ngày làm việc" },
  { city: "(Phí Mặc định)", baseFee: 40000, zoneType: "Tỉnh/ Thành Phố Khác", estimatedDeliveryTime: "3-5 ngày làm việc" },
];

const AddFeeShip = () => {
  // 1. Trạng thái để lưu danh sách khu vực phí ship
  const [shippingZones, setShippingZones] = useState([]); // 2. Trạng thái cho form thêm mới
  const [newZoneData, setNewZoneData] = useState({
    city: "",
    baseFee: 0,
    estimatedDeliveryTime: "1-2 ngày làm việc",
    zoneType: "Tỉnh/ Thành Phố Khác",
  }); // 3. Trạng thái cho việc chỉnh sửa
  const [editingZone, setEditingZone] = useState(null); // Lưu ID của zone đang chỉnh sửa

  const [loadingList, setLoadingList] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false); // Loading cho Batch Add // Hàm chung để gọi API (Admin)

  const fetchAdminApi = async (url, options = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Accept: "application/json",
        },
      });
      return response.json();
    } catch (error) {
      console.error("Lỗi kết nối Server:", error);
      alert("Lỗi kết nối Server.");
      return null;
    }
  }; // CHỨC NĂNG: LẤY DANH SÁCH KHU VỰC PHÍ SHIP

  const fetchZones = async () => {
    setLoadingList(true);
    const data = await fetchAdminApi("http://localhost:4000/getfeeship");

    if (data && data.success) {
      setShippingZones(data.zones);
    } else if (data) {
      alert(`Không thể tải danh sách: ${data.errors}`);
    }
    setLoadingList(false);
  };

  useEffect(() => {
    fetchZones();
  }, []); // Xử lý thay đổi input của form thêm mới (Giữ nguyên)

  const changeHandler = (e) => {
    const value = e.target.name === "baseFee" ? Number(e.target.value) : e.target.value;
    setNewZoneData({ ...newZoneData, [e.target.name]: value });
  }; // CHỨC NĂNG: THÊM TỈNH/THÀNH PHỐ (Single Add - Giữ nguyên)

  const AddZone = async (e) => {
    e.preventDefault();
    if (!newZoneData.city.trim() || newZoneData.baseFee < 0) {
      alert("Vui lòng nhập Tên Tỉnh/Thành phố và đảm bảo Phí vận chuyển là số dương.");
      return;
    }
    setLoadingAdd(true);
    const data = await fetchAdminApi("http://localhost:4000/addfeeship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newZoneData),
    });
    if (data && data.success) {
      alert(`Thêm Tỉnh/Thành phố "${data.zone.districtName}" thành công!`);
      setShippingZones([...shippingZones, data.zone]);
      setNewZoneData({ city: "", baseFee: 0, estimatedDeliveryTime: "1-2 ngày làm việc", zoneType: "Tỉnh/ Thành Phố Khác" });
    } else if (data) {
      alert(`Thất bại: ${data.errors || "Lỗi không xác định."}`);
    }
    setLoadingAdd(false);
  }; // 💡 CHỨC NĂNG: THÊM HÀNG LOẠT (BATCH ADD)

  const AddAllCities = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn thêm ${REMAINING_CITIES_DATA.length} bản ghi phí vận chuyển này? Các bản ghi đã tồn tại sẽ được bỏ qua.`)) {
      return;
    }
    setLoadingBatch(true);

    const data = await fetchAdminApi("http://localhost:4000/addfeeship_batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Backend API /addfeeship_batch cần nhận mảng dữ liệu trong field "zones"
      body: JSON.stringify({ zones: REMAINING_CITIES_DATA }),
    });

    if (data && data.success) {
      alert(`Thành công! Đã thêm ${data.insertedCount} khu vực mới.`); // Tải lại danh sách để cập nhật bảng
      await fetchZones();
    } else if (data) {
      alert(`Thất bại khi thêm hàng loạt: ${data.errors || "Lỗi không xác định."}`);
    }
    setLoadingBatch(false);
  }; // 💡 CHỨC NĂNG: LƯU CHỈNH SỬA (UPDATE ZONE)

  const handleSaveEdit = async (zoneId) => {
    const zoneToUpdate = shippingZones.find((zone) => zone._id === zoneId);
    if (!zoneToUpdate) return;
    if (zoneToUpdate.baseFee < 0) {
      alert("Phí vận chuyển phải là số dương.");
      return;
    }

    if (!window.confirm(`Xác nhận cập nhật phí ship cho ${zoneToUpdate.districtName}?`)) {
      return;
    }

    setEditingZone(null); // Tắt chế độ chỉnh sửa ngay // Gọi API /updatefeeship - bạn cần đảm bảo API này đã được tạo ở Backend

    const data = await fetchAdminApi(`http://localhost:4000/updatefeeship/${zoneId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseFee: zoneToUpdate.baseFee,
        estimatedDeliveryTime: zoneToUpdate.estimatedDeliveryTime,
        zoneType: zoneToUpdate.zoneType,
      }),
    });

    if (data && data.success) {
      alert(`Cập nhật phí cho ${data.zone.districtName} thành công!`); // Tải lại danh sách để đảm bảo dữ liệu là mới nhất (hoặc cập nhật state thủ công) // setShippingZones(shippingZones.map(z => z._id === zoneId ? data.zone : z));
      await fetchZones();
    } else if (data) {
      alert(`Cập nhật thất bại: ${data.errors || "Lỗi không xác định."}`); // Nếu cập nhật thất bại, tải lại để khôi phục dữ liệu cũ
      await fetchZones();
    }
  }; // 💡 Xử lý thay đổi input trong bảng chỉnh sửa (in-place editing)

  const handleTableChange = (e, zoneId, field) => {
    const newValue = field === "baseFee" ? Number(e.target.value) : e.target.value;
    setShippingZones(
      shippingZones.map((zone) => {
        if (zone._id === zoneId) {
          return { ...zone, [field]: newValue };
        }
        return zone;
      })
    );
  };

  return (
    <div className="add-fee-ship">
      <h1>Quản Lý Phí Vận Chuyển Theo Tỉnh/Thành Phố</h1> {/* PHẦN 1: FORM THÊM MỚI */}
      <div className="add-zone-container">
        <h2>Thêm Tỉnh/Thành Phố Mới (Một lần)</h2> {/* ... (Giữ nguyên Form Thêm Một Vùng) ... */}
        <form onSubmit={AddZone} className="add-zone-form">
          <div className="form-group">
            <label>Tên Tỉnh/Thành Phố (Ví dụ: Cà Mau, Hồ Chí Minh):</label>
            <input value={newZoneData.city} onChange={changeHandler} type="text" name="city" placeholder="Ví dụ: Tây Ninh hoặc Hồ Chí Minh" required />
          </div>

          <div className="form-group">
            <label>Phí Cố Định (VND):</label>
            <input value={newZoneData.baseFee} onChange={changeHandler} type="number" name="baseFee" min="0" required />
          </div>

          <div className="form-group">
            <label>Thời Gian Giao Hàng Ước Tính:</label>
            <input value={newZoneData.estimatedDeliveryTime} onChange={changeHandler} type="text" name="estimatedDeliveryTime" placeholder="Ví dụ: 1-2 ngày làm việc" />
          </div>

          <div className="form-group">
            <label>Phân Loại Vùng:</label>
            <select value={newZoneData.zoneType} onChange={changeHandler} name="zoneType">
              <option value="Tỉnh/ Thành Phố Khác">Tỉnh/ Thành Phố Khác</option>
              <option value="Nội Thành">Nội Thành (Đặc biệt)</option>
            </select>
          </div>

          <button type="submit" disabled={loadingAdd}>
            {loadingAdd ? "Đang Thêm..." : "THÊM TỈNH/THÀNH PHỐ"}
          </button>
        </form>
      </div>
      {/* 💡 NÚT THÊM HÀNG LOẠT */}
      <div className="batch-add-container">
        <p>Hoặc sử dụng chức năng thêm hàng loạt (Batch Add) để cài đặt phí mặc định cho 63 Tỉnh/Thành phố còn lại.</p>
        <button onClick={AddAllCities} disabled={loadingBatch || loadingList} className="batch-add-btn">
          {loadingBatch ? "Đang Thêm Hàng Loạt..." : `THÊM ${REMAINING_CITIES_DATA.length} TỈNH/TP (BATCH)`}
        </button>
      </div>
      <hr /> {/* PHẦN 2: DANH SÁCH KHU VỰC & CHỈNH SỬA */}
      <div className="list-zone-container">
        <h2>Danh Sách Phí Đã Thiết Lập</h2>
        {loadingList ? (
          <p>Đang tải danh sách khu vực...</p>
        ) : (
          <table className="zone-table">
            <thead>
              <tr>
                <th>Tên Tỉnh/Thành Phố</th>
                <th>Mã Chuẩn Hóa</th>
                <th>Phí Cơ Sở (VND)</th>
                <th>Phân Loại</th>
                <th>Thời Gian Giao Hàng</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {shippingZones.map((zone) => (
                <tr key={zone._id}>
                  <td>{zone.districtName}</td>
                  <td>{zone.cityCode}</td>
                  <td>
                    {editingZone === zone._id ? (
                      <input type="number" value={zone.baseFee} onChange={(e) => handleTableChange(e, zone._id, "baseFee")} min="0" style={{ width: "80px" }} />
                    ) : (
                      zone.baseFee.toLocaleString()
                    )}
                  </td>
                  <td>
                    {editingZone === zone._id ? (
                      <select value={zone.zoneType} onChange={(e) => handleTableChange(e, zone._id, "zoneType")}>
                        <option value="Tỉnh/ Thành Phố Khác">Tỉnh/ Thành Phố Khác</option>
                        <option value="Nội Thành">Nội Thành</option>
                      </select>
                    ) : (
                      zone.zoneType
                    )}
                  </td>
                  <td>
                    {editingZone === zone._id ? (
                      <input type="text" value={zone.estimatedDeliveryTime} onChange={(e) => handleTableChange(e, zone._id, "estimatedDeliveryTime")} style={{ width: "120px" }} />
                    ) : (
                      zone.estimatedDeliveryTime
                    )}
                  </td>
                  <td>
                    {editingZone === zone._id ? (
                      <button onClick={() => handleSaveEdit(zone._id)} className="save-btn">
                        Lưu
                      </button>
                    ) : (
                      <button onClick={() => setEditingZone(zone._id)} className="edit-btn">
                        Sửa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AddFeeShip;
