#  Product Finder Application

##  Overview

The **Product Finder Application** is a full-stack web application that allows users to **search, filter, and explore products dynamically**. Users can apply multiple filters such as brand, category, price range, and product attributes, and view detailed product information along with **vendor listings and pricing**.

This project demonstrates real-world full stack development using modern technologies and best practices.

---

##  Features

*  Dynamic product filtering (Brand, Category, Price, Attributes)
*  Advanced filter options with real-time updates
*  View product details with specifications
*  Multiple vendor listings per product
*  Price comparison across vendors
*  Pagination and sorting (price, name, newest)
*  Optimized backend queries using Entity Framework Core

---

##  Technology Stack

### Frontend

* React (Functional Components & Hooks)
* Axios (API communication)
* Responsive UI design

### Backend

* ASP.NET Core Web API (.NET 6+)
* RESTful API architecture
* Repository Pattern

### Database

* SQL Server
* Entity Framework Core (Code First Approach)

---

##  Architecture

The application follows a **layered architecture**:

* **Models** → Database entities
* **Repositories** → Data access logic
* **Controllers** → API endpoints
* **DTOs** → Data transfer between backend & frontend

---

##  Key Modules

### 🔹 Product Management

* Stores product details, categories, brands, and attributes

### 🔹 Dynamic Filtering System

* Supports multi-select filters
* Attribute-based filtering using flexible schema

### 🔹 Vendor Integration

* Multiple vendors per product
* Tracks price, stock, and availability

---

##  API Endpoints

### Products

* `POST /api/products/search` → Filter and fetch products
* `GET /api/products/{id}` → Get product details

### Filters

* `GET /api/filters` → Get filter options (brands, categories, attributes, price range)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/product-finder.git
cd product-finder
```

### 2. Backend Setup

```bash
cd ProductFinder.API
dotnet restore
dotnet ef database update
dotnet run
```

### 3. Frontend Setup

```bash
cd product-finder-ui
npm install
npm run dev
```

---

##  Future Enhancements

*  User authentication & authorization
*  Wishlist & favorites
*  Add to cart functionality
*  Product reviews and ratings
*  Advanced analytics & recommendations

---

##  Author

**SARAVANAN**

---

##  License

This project is for learning and demonstration purposes.
