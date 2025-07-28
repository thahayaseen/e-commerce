# 🛍️ E-Commerce Platform

A dynamic and responsive **e-commerce website** built using **Node.js, Express.js, EJS templating**, and **MongoDB** for backend, with **Bootstrap** for frontend styling. The platform supports user authentication, product management, cart, wishlist, checkout via Razorpay, order tracking, and admin features.

 
> GitHub Repo: [thahayaseen/e-commerce](https://github.com/thahayaseen/e-commerce)

---

## 🧑‍💻 Author

**Thaha Yaseen K**  
📍 Calicut, Kerala  
🌐 [GitHub](https://github.com/thahayaseen) | [LinkedIn](https://www.linkedin.com/in/thaha-yaseen)  

---

## 🚀 Features

### 🔐 Authentication
- Signup, Login, Logout
- Google OAuth Login
- Email verification using Nodemailer
- Forgot and reset password with secure link

### 🛍️ User Side
- Browse products with search and category filters
- View product details, add to cart/wishlist
- Checkout with Razorpay integration
- Order history and status tracking
- Profile management and address book
- Coupon management and offer system

### 🧑‍💼 Admin Panel
- Admin login and dashboard
- User management (block/unblock)
- Product CRUD with image uploads via Cloudinary
- Category & brand management
- Offer & coupon creation
- Order status update and control
- Banner management for homepage

---

## 🧰 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | EJS, Bootstrap 5, JavaScript        |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB with Mongoose               |
| Auth      | Session-based + Google OAuth        |
| Payment   | Razorpay                            |
| Image     | Cloudinary                          |
| Email     | Nodemailer (Gmail SMTP)             |
| Hosting   | *(You can add EC2/VPS info here)*   |

---

## 🛠️ Installation & Setup

### 1. Clone the repo

```bash
git clone https://github.com/thahayaseen/e-commerce.git
cd e-commerce
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variables

Create a `.env` file in the root directory and add the following:

```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAYSCECRET=your_secret

DOMAIN=http://localhost:4050
PORT=4050

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

PASSWORD=your_app_password_for_email
EMAIL=youremail@example.com
COMPANY_NAME=Your Company Name

MONGOOSE=your_mongo_db_connection_string
```

### 4. Run the server

```bash
npm start
```

The app will be available at [http://localhost:4050](http://localhost:4050)

---

## 📁 Folder Structure

```
e-commerce/
├── controllers/
├── models/
├── public/
│   ├── css/
│   ├── js/
├── routes/
│   ├── user.js
│   └── admin.js
├── views/
│   ├── user/
│   ├── admin/
│   └── partials/
├── middlewares/
├── utils/
├── app.js
├── .env
└── README.md
```

---

## 📸 Screenshots

> *(Add screenshots or demo GIFs showing homepage, cart, admin panel, etc. You can host them in the repo or link externally)*

---

## ✨ Roadmap / Future Improvements

- Add user notifications for order updates
- Integrate delivery tracking (Delhivery, Shiprocket API)
- Convert to React frontend with API-based backend
- Progressive Web App (PWA) version
- Add reviews and product rating system
- Dashboard analytics for admin (charts, sales)

---

## 📃 License

This project is open-source and available under the MIT License.

---

## 🙌 Contributions

Feel free to fork and submit a PR if you'd like to contribute or report issues.
