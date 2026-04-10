import React from "react";
import "./AddProduct.css";
import upload_area from "../../assets/upload_area.svg";
import addAllProducts from "./addAllProducts";

const AddProduct = () => {
  const [image, setImage] = React.useState(null); // ảnh chính
  const [detailImages, setDetailImages] = React.useState([]); // ảnh chi tiết
  const [productDetails, setProductDetails] = React.useState({
    name: "",
    image: "",
    detail_images: [],
    category: "womens",
    cost_price: "",
    old_price: "",
    new_price: "",
  });

  // chọn ảnh chính
  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  // chọn nhiều ảnh chi tiết
  const detailImagesHandler = (e) => {
    setDetailImages([...e.target.files]); // lưu tất cả ảnh
  };

  // nhập thông tin sản phẩm
  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  // hàm thêm sản phẩm
  const Add_Product = async () => {
    try {
      let responseData;
      let product = { ...productDetails };

      // ---- 1. Upload ảnh chính ----
      if (!image) {
        alert("Vui lòng chọn ảnh chính");
        return;
      }
      let formData = new FormData();
      formData.append("product", image);

      await fetch("http://localhost:4000/upload", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      })
        .then((resp) => resp.json())
        .then((data) => {
          responseData = data;
        });

      if (!responseData.success) {
        alert("Không upload được ảnh chính");
        return;
      }

      product.image = responseData.image_url;

      // ---- 2. Upload các ảnh chi tiết ----
      let detailImageUrls = [];
      for (let i = 0; i < detailImages.length; i++) {
        let fd = new FormData();
        fd.append("product", detailImages[i]);

        try {
          let res = await fetch("http://localhost:4000/upload", {
            method: "POST",
            headers: { Accept: "application/json" },
            body: fd,
          });
          let data = await res.json();
          if (data.success) {
            detailImageUrls.push(data.image_url);
          }
        } catch (err) {
          console.error("Lỗi upload ảnh chi tiết:", err);
        }
      }
      product.detail_images = detailImageUrls;

      // ---- 3. Gửi sản phẩm lên server ----
      await fetch("http://localhost:4000/addproduct", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      })
        .then((resp) => resp.json())
        .then((data) => {
          data.success ? alert("✅ Đã Thêm Sản Phẩm") : alert("❌ Không Thể Thêm Sản Phẩm");
        });
    } catch (err) {
      console.error("Lỗi khi thêm sản phẩm:", err);
      alert("Có lỗi xảy ra!");
    }
  };

  return (
    <div className="add-product">
      <div className="addproduct-itemfield">
        <p>Tiêu Đề Sản Phẩm</p>
        <input value={productDetails.name} onChange={changeHandler} type="text" name="name" placeholder="Nhập tiêu đề sản phẩm" />
      </div>

      <div className="addproduct-price">
        <div className="addproduct-itemfield">
          <p>Giá Nhập Hàng</p>
          <input value={productDetails.cost_price} onChange={changeHandler} type="text" name="cost_price" placeholder="Nhập giá nhập hàng" />
        </div>
        <div className="addproduct-itemfield">
          <p>Giá</p>
          <input value={productDetails.old_price} onChange={changeHandler} type="text" name="old_price" placeholder="Nhập giá" />
        </div>
        <div className="addproduct-itemfield">
          <p>Giá khuyến mãi</p>
          <input value={productDetails.new_price} onChange={changeHandler} type="text" name="new_price" placeholder="Nhập giá khuyến mãi" />
        </div>
      </div>

      <div className="addproduct-itemfield">
        <p>Danh mục sản phẩm</p>
        <select value={productDetails.category} onChange={changeHandler} name="category" className="add-product-selector">
          <option value="womens">Nữ</option>
          <option value="mens">Nam</option>
          <option value="sports">Thể Thao</option>
        </select>
      </div>

      {/* Ảnh chính */}
      <div className="addproduct-itemfield">
        <p>Ảnh chính</p>
        <label htmlFor="file-input">
          <img src={image ? URL.createObjectURL(image) : upload_area} className="addproduct-thumnail-img" alt="preview" />
        </label>
        <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
      </div>

      {/* Ảnh chi tiết */}
      <div className="addproduct-itemfield">
        <p>Ảnh chi tiết (có thể chọn nhiều)</p>
        <input type="file" multiple onChange={detailImagesHandler} name="detail_images" />
        <div className="detail-preview">{detailImages.length > 0 && detailImages.map((file, i) => <img key={i} src={URL.createObjectURL(file)} alt="detail" className="addproduct-detail-img" />)}</div>
      </div>

      <button onClick={Add_Product} className="addproduct-btn">
        Thêm
      </button>
      <button className="addproduct-btn addAll-Product" onClick={addAllProducts}>
        Thêm toàn bộ sản phẩm từ mẫu
      </button>
    </div>
  );
};

export default AddProduct;
