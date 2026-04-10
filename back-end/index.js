const port = 4000;

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
// Cấu hình Middleware
app.use(express.json());
app.use(cors());

// Kết nối MongoDB
mongoose
  .connect("mongodb+srv://admin123:dukchii123@cluster0.7yx9dkn.mongodb.net/e-commerce")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Kiểm tra Health Check
app.get("/", (req, res) => {
  res.send("Hello From DukChii Learning Backend");
});

// 📦 Cấu hình Cloudinary
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
cloudinary.config({
  cloud_name: "dor31csjk",
  api_key: "727471877944543",
  api_secret: "ndv-TUV0GYIzCOT7gODSlMSrblA",
});

// 📦 Cấu hình Cloudinary Storage cho Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecom_products", // Tên thư mục trong Cloudinary
    allowed_formats: ["jpeg", "png", "jpg", "webp"],
  },
});

const upload = multer({ storage: storage });

// ✅ API UPLOAD IMAGE (SỬ DỤNG CLOUDINARY)
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "Không tìm thấy file" });
  }
  // Cloudinary tự động trả về req.file.path là URL công khai
  res.json({
    success: 1,
    image_url: req.file.path, // Đây là URL công cộng
  });
});

// SCHEMA SẢN PHẨM (PRODUCT)
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  detail_images: { type: [String], default: [] },
  category: { type: String, required: true },
  cost_price: { type: Number, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  availabel: { type: Boolean, default: true },
  sold_count: { type: Number, default: 0 },

  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true }, // Tham chiếu đến người dùng
      userName: { type: String, required: true }, // Tên người dùng để hiển thị
      rating: { type: Number, min: 1, max: 5, required: true },
      comment: { type: String, default: "" },
      date: { type: Date, default: Date.now },
    },
  ],
  averageRating: { type: Number, default: 0 }, // Điểm trung bình
  numReviews: { type: Number, default: 0 }, // Tổng số đánh giá
});

// API THÊM SẢN PHẨM
app.post("/addproduct", async (req, res) => {
  try {
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const newId = lastProduct ? lastProduct.id + 1 : 1;

    const product = new Product({
      id: newId, // Sử dụng ID mới
      name: req.body.name,
      image: req.body.image,
      detail_images: req.body.detail_images || [],
      category: req.body.category,
      cost_price: req.body.cost_price,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await product.save();
    res.json({ success: true, id: newId, name: req.body.name, message: "Thêm sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi thêm sản phẩm" });
  }
});

// API XÓA SẢN PHẨM
app.post("/removeproduct", async (req, res) => {
  try {
    const result = await Product.findOneAndDelete({ id: req.body.id });
    if (!result) {
      return res.status(404).json({ success: false, errors: "Không tìm thấy sản phẩm để xóa" });
    }
    res.json({ success: true, message: `Đã xóa sản phẩm ID: ${req.body.id}` });
  } catch (error) {
    res.status(500).json({ success: false, errors: "Lỗi Server khi xóa sản phẩm" });
  }
});

// API LẤY TẤT CẢ SẢN PHẨM
app.get("/allproducts", async (req, res) => {
  try {
    let products = await Product.find({});
    res.send(products);
  } catch (error) {
    res.status(500).json({ success: false, errors: "Lỗi Server khi lấy danh sách sản phẩm" });
  }
});

// SCHEMA NGƯỜI DÙNG (USERS)

const Users = mongoose.model("Users", {
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  cartData: { type: Object, default: {} },
  date: { type: Date, default: Date.now },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

// API ĐĂNG KÝ (SIGNUP)
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/; // Mật khẩu >= 6 ký tự, có Hoa, Thường, Số

  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, errors: "Định dạng email không hợp lệ." });
  }
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ success: false, errors: "Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số." });
  }

  try {
    let check = await Users.findOne({ email });
    if (check) {
      return res.status(400).json({ success: false, errors: "Email đã tồn tại" });
    } // 🔑 BẢO MẬT: MÃ HÓA MẬT KHẨU

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); // Khởi tạo giỏ hàng rỗng

    const user = new Users({
      name: username,
      email: email,
      password: hashedPassword,
      cartData: {}, // Giỏ hàng ban đầu là rỗng
    });

    await user.save();

    const data = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(data, "secret_ecom");
    res.json({ success: true, token, username: user.name });
  } catch (error) {
    console.error("Lỗi Đăng ký:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi đăng ký" });
  }
});

// API ĐĂNG NHẬP (LOGIN)
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await Users.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, errors: "Sai email" });
    } // 🔑 BẢO MẬT: SO SÁNH MẬT KHẨU ĐÃ MÃ HÓA

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const data = { user: { id: user.id, role: user.role } };
      const token = jwt.sign(data, "secret_ecom");
      res.json({
        success: true,
        token,
        username: user.name,
      });
    } else {
      res.status(401).json({ success: false, errors: "Sai mật khẩu" });
    }
  } catch (error) {
    console.error("Lỗi Đăng nhập:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi đăng nhập" });
  }
});

// API cho NEW COLLECTION (Sản phẩm mới nhất)
app.get("/newcollection", async (req, res) => {
  try {
    // Lấy 8 sản phẩm mới nhất (sắp xếp theo ngày tạo)
    let newcollection = await Product.find({}).sort({ date: -1 }).limit(8);
    res.send(newcollection);
  } catch (error) {
    res.status(500).json({ success: false, errors: "Lỗi Server khi lấy bộ sưu tập mới" });
  }
});

// API cho SẢN PHẨM NỔI TIẾNG VỚI NỮ (Popular in Women)
app.get("/popularinwomen", async (req, res) => {
  try {
    // Lấy 4 sản phẩm 'womens' có sold_count cao nhất
    let popular_in_women = await Product.find({ category: "womens" }).sort({ sold_count: -1 }).limit(4);
    res.send(popular_in_women);
  } catch (error) {
    res.status(500).json({ success: false, errors: "Lỗi Server khi lấy sản phẩm nổi tiếng" });
  }
});

// MIDDLEWARE XÁC THỰC TOKEN (CẬP NHẬT)
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    return res.status(401).send({ errors: "Vui lòng đăng nhập tài khoản (Yêu cầu Token)." });
  }
  try {
    // Cập nhật: Giải mã cả role
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).send({ errors: "Token không hợp lệ. Vui lòng đăng nhập lại." });
  }
};
// API THÊM VÀO GIỎ HÀNG
app.post("/addtocart", fetchUser, async (req, res) => {
  const itemId = String(req.body.itemId); // Đảm bảo itemId là string
  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, errors: "Người dùng không tồn tại" }); // Tăng số lượng sản phẩm lên 1

    user.cartData[itemId] = (user.cartData[itemId] || 0) + 1; // Lưu lại

    user.markModified("cartData");
    await user.save();

    res.json({ success: true, message: "Đã Thêm sản phẩm vào giỏ hàng" });
  } catch (error) {
    console.error("Lỗi thêm vào giỏ hàng:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi thêm vào giỏ hàng" });
  }
});

// API XÓA KHỎI GIỎ HÀNG
app.post("/removefromcart", fetchUser, async (req, res) => {
  const itemId = String(req.body.itemId);
  try {
    const user = await Users.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, errors: "Người dùng không tồn tại" }); // Giảm số lượng, nếu <= 1 thì xóa khỏi object

    if (user.cartData[itemId] && user.cartData[itemId] > 0) {
      user.cartData[itemId] -= 1;
      if (user.cartData[itemId] === 0) {
        delete user.cartData[itemId]; // Xóa hẳn mục nếu số lượng về 0
      }
    }

    user.markModified("cartData");
    await user.save();

    res.json({ success: true, message: "Đã Xóa sản phẩm khỏi giỏ hàng" });
  } catch (error) {
    console.error("Lỗi xóa khỏi giỏ hàng:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi xóa khỏi giỏ hàng" });
  }
});

// API LẤY DỮ LIỆU GIỎ HÀNG
app.post("/getcart", fetchUser, async (req, res) => {
  try {
    const userData = await Users.findById(req.user.id);
    if (!userData) return res.status(404).json({ success: false, errors: "Người dùng không tồn tại" });

    res.json(userData.cartData);
  } catch (error) {
    res.status(500).json({ success: false, errors: "Lỗi Server khi lấy dữ liệu giỏ hàng" });
  }
});

// SCHEMA ĐƠN HÀNG (ORDER)

const Order = mongoose.model("Order", {
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: Number, required: true },
      name: { type: String },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }, // Giá bán
      cost: { type: Number, required: true }, // Giá vốn
    },
  ],
  totalAmount: { type: Number, required: true }, // Tổng Doanh thu
  totalCost: { type: Number, default: 0 }, // Tổng Chi phí
  shippingFee: { type: Number, default: 0 },
  shippingAddress: { type: String, required: true },
  couponCode: { type: String, default: null },
  discountApplied: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  status: { type: String, default: "Completed" },
});

// API THANH TOÁN (CHECKOUT)
app.post("/checkout", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id; // 💡 Lấy tất cả dữ liệu từ Frontend
    const { cartItems, totalAmount, shippingFee, shippingAddress, couponCode, discountApplied } = req.body;

    if (!cartItems || Object.keys(cartItems).length === 0) {
      return res.status(400).json({ success: false, errors: "Giỏ hàng rỗng, không thể thanh toán." });
    }

    const itemsForOrder = [];
    let totalCost = 0; // 1. Lặp qua giỏ hàng để xác nhận sản phẩm và cập nhật sold_count

    for (const itemId in cartItems) {
      const quantity = cartItems[itemId];
      if (quantity > 0) {
        const product = await Product.findOne({ id: Number(itemId) });

        if (!product) {
          console.warn(`Sản phẩm ID ${itemId} không tồn tại, bỏ qua.`);
          continue;
        }

        itemsForOrder.push({
          productId: product.id,
          name: product.name,
          quantity: quantity,
          price: product.new_price,
          cost: product.cost_price,
        });

        totalCost += product.cost_price * quantity;
        await Product.updateOne({ id: product.id }, { $inc: { sold_count: quantity } });
      }
    }

    if (itemsForOrder.length === 0) {
      return res.status(400).json({ success: false, errors: "Không có sản phẩm hợp lệ trong giỏ hàng để thanh toán." });
    } // 2. Tạo bản ghi Đơn hàng  (Order)

    const newOrder = new Order({
      userId: userId,
      items: itemsForOrder,
      totalAmount: totalAmount,
      totalCost: totalCost,
      shippingFee: shippingFee,
      shippingAddress: shippingAddress,
      couponCode: couponCode,
      discountApplied: discountApplied,
      date: new Date(),
      status: "Completed",
    });

    await newOrder.save(); // 3. Cập nhật số lần sử dụng cho Coupon

    if (couponCode && discountApplied > 0) {
      await Coupon.updateOne({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
    } // 4. Xóa giỏ hàng của người dùng

    await Users.updateOne({ _id: userId }, { $set: { cartData: {} } }); // 5. Trả về phản hồi thành công để Frontend chuyển hướng

    res.json({ success: true, message: "Thanh toán thành công! Đơn hàng đã được ghi nhận." });
  } catch (error) {
    console.error("Lỗi khi xử lý thanh toán:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi thanh toán. Vui lòng kiểm tra dữ liệu." });
  }
});

app.get("/financialdata", async (req, res) => {
  try {
    const totals = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalProfit: { $sum: { $subtract: ["$totalAmount", "$totalCost"] } }, // Lợi nhuận = Doanh thu - Chi phí
        },
      },
    ]); // TÍNH TOÁN DOANH THU THEO THÁNG

    const monthlySummary = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          revenue: { $sum: "$totalAmount" },
          profit: { $sum: { $subtract: ["$totalAmount", "$totalCost"] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          revenue: 1,
          profit: 1,
        },
      },
    ]);

    res.json({
      totalRevenue: totals[0]?.totalRevenue || 0,
      totalProfit: totals[0]?.totalProfit || 0,
      monthlySummary: monthlySummary,
    });
  } catch (error) {
    console.error("Lỗi Aggregation DB:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi tính toán tài chính" });
  }
});

app.get("/customers", async (req, res) => {
  try {
    // Lấy tất cả người dùng (từ Users collection)
    const allUsers = await Users.find({}).select("name email date"); // Chỉ lấy tên, email, ngày tạo

    if (allUsers.length === 0) {
      return res.json([]);
    } // Tổng hợp dữ liệu mua hàng (từ Order collection)

    const purchaseSummary = await Order.aggregate([
      {
        $group: {
          _id: "$userId", // Nhóm theo ID người dùng
          totalSpent: { $sum: "$totalAmount" }, // Tổng tiền đã mua
          totalItems: { $sum: { $sum: "$items.quantity" } }, // Tổng số lượng sản phẩm đã mua
          totalOrders: { $sum: 1 }, // Tổng số đơn hàng
        },
      },
    ]);
    // Chuyển đổi mảng tổng hợp thành một Map/Object để dễ dàng tra cứu
    const summaryMap = new Map();
    purchaseSummary.forEach((summary) => {
      summaryMap.set(summary._id.toString(), summary);
    });
    // Kết hợp dữ liệu Users và Order
    const customersData = allUsers.map((user) => {
      const summary = summaryMap.get(user._id.toString());

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.date,
        totalSpent: summary ? summary.totalSpent : 0, // Số tiền đã mua
        totalItems: summary ? summary.totalItems : 0, // Số lượng sản phẩm
        totalOrders: summary ? summary.totalOrders : 0, // Số đơn hàng
      };
    });

    res.json({ success: true, customers: customersData });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu khách hàng:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi tổng hợp dữ liệu khách hàng" });
  }
});

// API LẤY LỊCH SỬ ĐƠN HÀNG CỦA KHÁCH HÀNG
app.post("/orderhistory", fetchUser, async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ token đã xác thực
    // Tìm tất cả các đơn hàng (Order) của userId này
    // Sắp xếp theo ngày mới nhất
    const orders = await Order.find({ userId: userId }).sort({ date: -1 });

    if (orders.length === 0) {
      return res.json({ success: true, message: "Bạn chưa có đơn hàng nào.", orders: [] });
    } // Trả về danh sách đơn hàng

    res.json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi lấy lịch sử đơn hàng." });
  }
});

app.post("/addreview/:productId", fetchUser, async (req, res) => {
  try {
    const productId = req.params.productId; // Lấy productId từ URL params
    const { rating, comment } = req.body;
    const userId = req.user.id; // Lấy userId từ token // Kiểm tra xem rating có hợp lệ không
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, errors: "Điểm đánh giá phải từ 1 đến 5." });
    }

    const product = await Product.findOne({ id: Number(productId) });
    if (!product) {
      return res.status(404).json({ success: false, errors: "Không tìm thấy sản phẩm." });
    } // Tìm thông tin người dùng để lấy tên

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, errors: "Người dùng không tồn tại." });
    } // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa

    const existingReviewIndex = product.reviews.findIndex((review) => review.userId.toString() === userId);

    if (existingReviewIndex > -1) {
      // Cập nhật đánh giá hiện có
      product.reviews[existingReviewIndex].rating = rating;
      product.reviews[existingReviewIndex].comment = comment;
      product.reviews[existingReviewIndex].date = Date.now();
      console.log(`Cập nhật đánh giá cho sản phẩm ${productId} bởi user ${user.name}`);
    } else {
      // Thêm đánh giá mới
      product.reviews.push({
        userId: userId,
        userName: user.name, // Lấy tên người dùng
        rating: rating,
        comment: comment,
        date: Date.now(),
      });
      console.log(`Thêm đánh giá mới cho sản phẩm ${productId} bởi user ${user.name}`);
    } // Cập nhật averageRating và numReviews

    product.numReviews = product.reviews.length;
    product.averageRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(200).json({ success: true, message: "Đánh giá sản phẩm thành công!", product });
  } catch (error) {
    console.error("Lỗi khi thêm/cập nhật đánh giá:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi thêm/cập nhật đánh giá." });
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) {
      return res.status(404).json({ success: false, errors: "Không tìm thấy sản phẩm." });
    }
    res.json({ success: true, product: product });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi lấy chi tiết sản phẩm." });
  }
});

// API ĐỔI MẬT KHẨU
app.post("/changepassword", fetchUser, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Lấy userId từ token đã giải mã // 1. Tìm người dùng

    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, errors: "Người dùng không tồn tại." });
    } // 2. So sánh mật khẩu cũ

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, errors: "Mật khẩu cũ không đúng." });
    } // 3. Kiểm tra độ dài/phức tạp của mật khẩu mới (Tùy chọn)

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, errors: "Mật khẩu mới phải có ít nhất 8 ký tự." });
    } // 4. Mã hóa (Hash) và lưu mật khẩu mới

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: "Đổi mật khẩu thành công." });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server." });
  }
});

const Coupon = mongoose.model("Coupon", {
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  discountType: {
    type: String,
    enum: ["fixed", "percentage"],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  minOrderAmount: {
    type: Number,
    default: 0, // Giá trị đơn hàng tối thiểu để áp dụng
  },
  usageLimit: {
    type: Number,
    default: -1, // Giới hạn số lần sử dụng. -1 là không giới hạn.
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

app.post("/addcoupon", async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, usageLimit, expiryDate } = req.body; // 1. Kiểm tra mã đã tồn tại chưa

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ success: false, errors: "Mã giảm giá này đã tồn tại." });
    } // 2. Tạo mã mới

    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      usageLimit: Number(usageLimit) || -1,
      expiryDate: new Date(expiryDate),
    });

    await newCoupon.save();
    res.json({ success: true, message: "Tạo mã giảm giá thành công!", coupon: newCoupon });
  } catch (error) {
    console.error("Lỗi khi tạo mã giảm giá:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi tạo mã giảm giá." });
  }
});

app.get("/allcoupons", async (req, res) => {
  try {
    let coupons = await Coupon.find({});
    res.json({ success: true, coupons });
  } catch (error) {
    console.error("Lỗi khi lấy mã giảm giá:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server." });
  }
});

app.post("/applycoupon", async (req, res) => {
  try {
    const { couponCode, cartTotalAmount } = req.body;

    if (!couponCode) {
      return res.status(400).json({ success: false, errors: "Vui lòng nhập mã giảm giá." });
    }

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, errors: "Mã giảm giá không hợp lệ." });
    } // 1. Kiểm tra ngày hết hạn

    if (coupon.expiryDate < Date.now()) {
      return res.status(400).json({ success: false, errors: "Mã giảm giá đã hết hạn." });
    } // 2. Kiểm tra giới hạn sử dụng

    if (coupon.usageLimit !== -1 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, errors: "Mã giảm giá đã hết lượt sử dụng." });
    } // 3. Kiểm tra giá trị đơn hàng tối thiểu

    if (cartTotalAmount < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, errors: `Đơn hàng tối thiểu phải là ${coupon.minOrderAmount.toLocaleString()} VNĐ.` });
    } // 4. Tính toán giảm giá

    let discountAmount = 0;
    if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === "percentage") {
      discountAmount = cartTotalAmount * (coupon.discountValue / 100); // Có thể giới hạn giảm giá tối đa ở đây nếu cần (Ví dụ: Giảm tối đa 500k)
    } // Trả về thông tin giảm giá để FE hiển thị

    res.json({
      success: true,
      message: "Áp dụng mã giảm giá thành công!",
      discountAmount: Math.floor(discountAmount),
      couponCode: coupon.code,
    });
  } catch (error) {
    console.error("Lỗi khi áp dụng mã giảm giá:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server." });
  }
});

// SCHEMA BẢNG PHÍ VẬN CHUYỂN (ShippingZone)
const ShippingZone = mongoose.model("ShippingZone", {
  // Tên Tỉnh/Thành phố (Ví dụ: "Cà Mau", "Hồ Chí Minh")
  districtName: { type: String, required: true, unique: true }, // Đảm bảo tên tỉnh là unique // Mã chuẩn hóa của Tỉnh/Thành phố (vd: "camau", "hochiminh")
  cityCode: { type: String, required: true, unique: true }, // Mã chuẩn hóa cũng là unique
  baseFee: { type: Number, required: true, min: 0 },
  estimatedDeliveryTime: { type: String, default: "1-2 ngày làm việc" },
  zoneType: { type: String, enum: ["Nội Thành", "Tỉnh/ Thành Phố Khác"], default: "Tỉnh/ Thành Phố Khác" },
});

// Thêm hàm loại bỏ dấu khi đưa vào database
const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// API THÊM KHU VỰC VẬN CHUYỂN
app.post("/addfeeship", async (req, res) => {
  try {
    // Frontend chỉ cần gửi: city, baseFee, estimatedDeliveryTime, zoneType
    const { city, baseFee, estimatedDeliveryTime, zoneType } = req.body;

    // Sử dụng 'city' làm tên hiển thị
    const districtName = city;

    if (!districtName || baseFee === undefined) {
      return res.status(400).json({ success: false, errors: "Thiếu Tên Tỉnh/Thành phố hoặc Phí cơ sở." });
    }

    // 💡 TẠO MÃ CITYCODE CHUẨN HÓA
    const cityCode = removeAccents(districtName.trim()).replace(/\s/g, "").toLowerCase();

    // 💡 Kiểm tra tên Tỉnh/Thành phố đã tồn tại chưa
    const existingZone = await ShippingZone.findOne({ $or: [{ districtName: districtName }, { cityCode: cityCode }] });
    if (existingZone) {
      return res.status(400).json({ success: false, errors: `Tỉnh/Thành phố "${districtName}" đã tồn tại.` });
    }

    const newZone = new ShippingZone({
      districtName: districtName.trim(), // Lưu tên Tỉnh/Thành phố đầy đủ
      cityCode: cityCode, // Lưu mã chuẩn hóa
      baseFee: Number(baseFee),
      estimatedDeliveryTime: estimatedDeliveryTime || "1-2 ngày làm việc",
      zoneType: zoneType || "Tỉnh/ Thành Phố Khác",
    });

    await newZone.save();
    res.json({ success: true, message: `Thêm Tỉnh/Thành phố "${districtName}" thành công.`, zone: newZone });
  } catch (error) {
    console.error("Lỗi khi thêm khu vực vận chuyển:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi thêm khu vực vận chuyển." });
  }
});

// API TÍNH PHÍ VẬN CHUYỂN THEO VÙNG (CHỈ THEO TỈNH/THÀNH PHỐ)
app.post("/feeship", async (req, res) => {
  // 💡 Frontend chỉ cần gửi 'selectedCity' (tên Tỉnh/Thành phố)
  const { selectedCity } = req.body;

  if (!selectedCity) {
    return res.status(400).json({ success: false, errors: "Vui lòng chọn Tỉnh/Thành phố." });
  }

  try {
    // 1. Tạo cityCode để tìm kiếm
    const cityCode = removeAccents(selectedCity.trim()).replace(/\s/g, "").toLowerCase();

    // 2. Tìm kiếm phí ship dựa trên CityCode chính xác
    let shippingZone = await ShippingZone.findOne({ cityCode: cityCode });

    if (!shippingZone) {
      // 3. Nếu không tìm thấy, thử tìm phí mặc định
      console.warn(`Không tìm thấy phí cho ${selectedCity}. Thử áp dụng phí mặc định.`);
      shippingZone = await ShippingZone.findOne({ districtName: "(mặc định)" });
    } // 4. Kiểm tra phí cuối cùng

    if (!shippingZone) {
      return res.status(404).json({ success: false, errors: "Hệ thống chưa thiết lập phí vận chuyển cho khu vực này (và không có phí mặc định)." });
    } // 5. Trả về kết quả

    res.json({
      success: true,
      shippingFee: shippingZone.baseFee,
      estimatedDeliveryTime: shippingZone.estimatedDeliveryTime,
      zoneType: shippingZone.zoneType,
      message: `Phí vận chuyển cho khu vực ${shippingZone.districtName}`,
    });
  } catch (error) {
    console.error("Lỗi Server khi tính phí vận chuyển theo vùng:", error.message);
    res.status(500).json({ success: false, errors: "Lỗi Server khi tính phí vận chuyển." });
  }
});

// API THÊM CÁC KHU VỰC VẬN CHUYỂN VÀ PHÍ SHIP NHANH CHÓNG
// API LƯU NHIỀU BẢN GHI PHÍ SHIP CÙNG LÚC (BATCH INSERT)
app.post("/addfeeship_batch", async (req, res) => {
  try {
    const { zones } = req.body; // Yêu cầu mảng 'zones' từ Frontend/Postman

    if (!Array.isArray(zones) || zones.length === 0) {
      return res.status(400).json({ success: false, errors: "Dữ liệu phải là một mảng không rỗng." });
    }

    const itemsToInsert = [];
    const existingCities = await ShippingZone.find({}).select("cityCode");
    const existingCityCodes = existingCities.map((z) => z.cityCode); // Chuẩn hóa và tạo mảng dữ liệu để chèn

    for (const item of zones) {
      if (!item.city || item.baseFee === undefined) continue; // Bỏ qua nếu thiếu dữ liệu cơ bản

      const districtName = item.city.trim();
      const cityCode = removeAccents(districtName).replace(/\s/g, "").toLowerCase(); // Bỏ qua nếu CityCode đã tồn tại (tránh lỗi trùng lặp)

      if (existingCityCodes.includes(cityCode)) {
        console.warn(`Khu vực "${districtName}" đã tồn tại. Bỏ qua.`);
        continue;
      }

      itemsToInsert.push({
        districtName: districtName,
        cityCode: cityCode,
        baseFee: Number(item.baseFee),
        estimatedDeliveryTime: item.delivery || item.estimatedDeliveryTime || "1-2 ngày làm việc",
        zoneType: item.zoneType || "Tỉnh/ Thành Phố Khác",
      });
    }

    if (itemsToInsert.length === 0) {
      return res.status(400).json({ success: false, errors: "Không có bản ghi hợp lệ hoặc tất cả đã tồn tại." });
    } // Sử dụng insertMany để chèn tất cả cùng lúc

    const result = await ShippingZone.insertMany(itemsToInsert);

    res.json({
      success: true,
      message: `Thêm thành công ${result.length} khu vực vận chuyển mới.`,
      insertedCount: result.length,
    });
  } catch (error) {
    console.error("Lỗi Server khi thêm hàng loạt phí vận chuyển:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi thêm hàng loạt phí vận chuyển." });
  }
});
// API LẤY TẤT CẢ KHU VỰC VẬN CHUYỂN
app.get("/getfeeship", async (req, res) => {
  try {
    let shippingZones = await ShippingZone.find({});
    res.json({ success: true, zones: shippingZones });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khu vực vận chuyển:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi lấy danh sách khu vực vận chuyển." });
  }
});

// API UPDATE FEESHP
app.put("/updatefeeship/:id", async (req, res) => {
  try {
    const { baseFee, estimatedDeliveryTime, zoneType } = req.body;
    const zoneId = req.params.id;

    const updatedZone = await ShippingZone.findByIdAndUpdate(
      zoneId,
      {
        baseFee: baseFee,
        estimatedDeliveryTime: estimatedDeliveryTime,
        zoneType: zoneType,
      },
      { new: true }
    ); // { new: true } trả về tài liệu đã cập nhật

    if (!updatedZone) {
      return res.status(404).json({ success: false, errors: "Không tìm thấy khu vực để cập nhật." });
    }

    res.json({ success: true, zone: updatedZone, message: "Cập nhật thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi cập nhật phí vận chuyển." });
  }
});

app.get("/admin/userorders/:userId", fetchUser, async (req, res) => {
  try {
    // Lấy ID người dùng cần tra cứu từ URL parameter
    const targetUserId = req.params.userId;

    // Bạn có thể tùy chọn kiểm tra xem người truy cập (req.user.id) có phải là Admin hay không tại đây.
    // Ví dụ: if (req.user.role !== 'admin') { return res.status(403).json(...); }

    if (!targetUserId) {
      return res.status(400).json({ success: false, errors: "Thiếu ID người dùng cần tra cứu." });
    }

    // 1. Truy vấn tất cả đơn hàng (Order) của targetUserId này
    // 2. Sắp xếp theo ngày mới nhất (date: -1)
    const orders = await Order.find({ userId: targetUserId }).sort({ date: -1 });

    if (orders.length === 0) {
      return res.json({
        success: true,
        message: "Khách hàng này chưa có đơn hàng nào.",
        orders: [],
      });
    }

    // 3. Trả về danh sách đơn hàng
    res.json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Lỗi Server khi tải đơn hàng Admin:", error);
    res.status(500).json({ success: false, errors: "Lỗi Server khi lấy dữ liệu đơn hàng khách hàng." });
  }
});

app.listen(port, (error) => {
  if (!error) {
    console.log("Server đang chạy tại http://localhost:" + port);
  } else {
    console.log("Lỗi khởi động server: " + error);
  }
});
