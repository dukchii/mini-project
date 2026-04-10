import all_product from "../../assets/all_product";

/**
 * Hàm tạo độ trễ (delay)
 * @param {number} ms - Thời gian trễ tính bằng mili giây
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Hàm upload ảnh tới server (/upload)
 * @param {string} imagePath - Đường dẫn ảnh local
 * @returns {Promise<string>} - URL ảnh trả về từ server
 */
const uploadImage = async (imagePath) => {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();

    // đặt tên file ngẫu nhiên để tránh mất tên
    const filename = `upload_${Date.now()}.png`;

    const formData = new FormData();
    formData.append("product", blob, filename);

    const res = await fetch("http://localhost:4000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      return data.image_url;
    } else {
      throw new Error("Upload thất bại");
    }
  } catch (err) {
    console.error("Lỗi upload ảnh:", err);
    throw err;
  }
};

const addAllProducts = async () => {
  const products = all_product;
  const delayMs = 200;
  let successCount = 0;
  let failureCount = 0;

  console.log("--- BẮT ĐẦU THÊM SẢN PHẨM ---");

  for (const product of products) {
    try {
      // 1. Upload ảnh chính
      const imageUrl = await uploadImage(product.image);

      // 2. Upload toàn bộ ảnh chi tiết
      const detailImageUrls = [];
      for (const detailImg of product.detail_images || []) {
        try {
          const url = await uploadImage(detailImg);
          detailImageUrls.push(url);
        } catch (err) {
          console.warn(`❌ Upload ảnh chi tiết thất bại: ${detailImg}`, err.message);
        }
        await delay(200);
      }

      // 3. Tạo body gửi lên server
      const bodyData = {
        name: product.name,
        category: product.category,
        cost_price: product.cost_price,
        old_price: product.old_price,
        new_price: product.new_price,
        image: imageUrl, // ảnh chính
        detail_images: detailImageUrls, // ảnh chi tiết
      };

      const res = await fetch("http://localhost:4000/addproduct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        successCount++;
        console.log(`[#${successCount}] ${product.name} ✅ Thêm thành công (ID: ${data.id})`);
      } else {
        failureCount++;
        console.warn(`[❌ THẤT BẠI] ${product.name} (${res.status}):`, data.message || "Không rõ lỗi");
      }
    } catch (err) {
      failureCount++;
      console.error(`[LỖI FETCH] khi thêm ${product.name}:`, err.message);
    }

    await delay(delayMs);
  }

  console.log("--- HOÀN TẤT ---");
  console.log(`Kết quả: ✅ ${successCount} thành công | ❌ ${failureCount} thất bại`);
};

export default addAllProducts;
