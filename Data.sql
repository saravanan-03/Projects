
USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'ProductFinderDB')
    CREATE DATABASE ProductFinderDB;
GO

USE ProductFinderDB;
GO


CREATE TABLE Brands (
    BrandId     INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(100) NOT NULL,
    LogoUrl     NVARCHAR(500) NULL,
    CreatedAt   DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE Categories (
    CategoryId      INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(100) NOT NULL,
    ParentCategoryId INT NULL REFERENCES Categories(CategoryId),
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE()
);


CREATE TABLE AttributeDefinitions (
    AttributeId     INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(100) NOT NULL,   
    DataType        NVARCHAR(20)  NOT NULL    
        CHECK (DataType IN ('text','number','range')),
    Unit            NVARCHAR(20)  NULL,       
    IsFilterable    BIT NOT NULL DEFAULT 1,
    DisplayOrder    INT NOT NULL DEFAULT 0,
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE()
);



CREATE TABLE Products (
    ProductId           INT IDENTITY(1,1) PRIMARY KEY,
    Name                NVARCHAR(200) NOT NULL,
    ShortDescription    NVARCHAR(500) NULL,
    FullDescription     NVARCHAR(MAX) NULL,
    BrandId             INT NOT NULL REFERENCES Brands(BrandId),
    CategoryId          INT NOT NULL REFERENCES Categories(CategoryId),
    BasePrice           DECIMAL(18,2) NOT NULL,
    ImageUrl            NVARCHAR(500) NULL,
    IsActive            BIT NOT NULL DEFAULT 1,
    CreatedAt           DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX IX_Products_BrandId    ON Products(BrandId);
CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Products_BasePrice  ON Products(BasePrice);

CREATE TABLE ProductAttributes (
    ProductAttributeId  INT IDENTITY(1,1) PRIMARY KEY,
    ProductId           INT NOT NULL REFERENCES Products(ProductId) ON DELETE CASCADE,
    AttributeId         INT NOT NULL REFERENCES AttributeDefinitions(AttributeId),
    Value               NVARCHAR(200) NOT NULL,   
    CONSTRAINT UQ_ProductAttribute UNIQUE (ProductId, AttributeId)
);

CREATE INDEX IX_ProductAttributes_ProductId   ON ProductAttributes(ProductId);
CREATE INDEX IX_ProductAttributes_AttributeId ON ProductAttributes(AttributeId);



CREATE TABLE Vendors (
    VendorId    INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(150) NOT NULL,
    Website     NVARCHAR(500) NULL,
    LogoUrl     NVARCHAR(500) NULL,
    IsActive    BIT NOT NULL DEFAULT 1,
    CreatedAt   DATETIME2 DEFAULT GETUTCDATE()
);



CREATE TABLE ProductVendors (
    ProductVendorId INT IDENTITY(1,1) PRIMARY KEY,
    ProductId       INT NOT NULL REFERENCES Products(ProductId) ON DELETE CASCADE,
    VendorId        INT NOT NULL REFERENCES Vendors(VendorId),
    Price           DECIMAL(18,2) NOT NULL,
    StockQty        INT NOT NULL DEFAULT 0,
    StockStatus     NVARCHAR(30) NOT NULL DEFAULT 'In Stock'
        CHECK (StockStatus IN ('In Stock','Out of Stock','Pre-Order','Limited')),
    ListingUrl      NVARCHAR(500) NULL,
    UpdatedAt       DATETIME2 DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_ProductVendor UNIQUE (ProductId, VendorId)
);

CREATE INDEX IX_ProductVendors_ProductId ON ProductVendors(ProductId);
CREATE INDEX IX_ProductVendors_VendorId  ON ProductVendors(VendorId);


INSERT INTO Brands (Name) VALUES
    ('Samsung'), ('Apple'), ('Sony'), ('LG'), ('OnePlus'), ('Dell'), ('HP');


INSERT INTO Categories (Name, ParentCategoryId) VALUES
    ('Electronics', NULL),          
    ('Smartphones', 1),             
    ('Laptops', 1),                 
    ('Televisions', 1),             
    ('Audio', 1);                   


INSERT INTO AttributeDefinitions (Name, DataType, Unit, IsFilterable, DisplayOrder) VALUES
    ('RAM',         'text',   'GB',   1, 1),  
    ('Storage',     'text',   'GB',   1, 2),  
    ('Color',       'text',    NULL,  1, 3),  
    ('Screen Size', 'number', 'inch', 1, 4),   
    ('Battery',     'text',   'mAh',  1, 5),   
    ('Processor',   'text',    NULL,  1, 6),   
    ('Resolution',  'text',    NULL,  1, 7),   
    ('Weight',      'number', 'kg',   0, 8);   

INSERT INTO Vendors (Name, Website) VALUES
    ('Amazon',      'https://amazon.in'),
    ('Flipkart',    'https://flipkart.com'),
    ('Croma',       'https://croma.com'),
    ('Reliance Digital', 'https://reliancedigital.in'),
    ('Vijay Sales', 'https://vijaysales.com');


INSERT INTO Products (Name, ShortDescription, FullDescription, BrandId, CategoryId, BasePrice) VALUES
    ('Samsung Galaxy S24 Ultra',
     '6.8" QHD+ Dynamic AMOLED, 200MP camera, S-Pen included.',
     'The Galaxy S24 Ultra redefines what a smartphone can do. Featuring a 200MP main camera, built-in S-Pen, and Snapdragon 8 Gen 3 processor, it is the pinnacle of Android engineering.',
     1, 2, 124999),

    ('Apple iPhone 15 Pro',
     '6.1" Super Retina XDR, A17 Pro chip, Titanium design.',
     'iPhone 15 Pro features the A17 Pro chip with a 6-core GPU, USB 3 speeds, and a customizable Action button — all in aerospace-grade titanium.',
     2, 2, 134900),

    ('OnePlus 12',
     '6.82" LTPO AMOLED, Snapdragon 8 Gen 3, 100W charging.',
     'OnePlus 12 combines flagship performance with ultra-fast charging. Its Hasselblad-tuned camera and 5400 mAh battery make it a powerhouse for daily use.',
     5, 2, 64999),

    ('Samsung Galaxy Book4 Pro',
     '16" AMOLED laptop, Intel Core Ultra 7, 16GB RAM.',
     'Galaxy Book4 Pro delivers a stunning 3K AMOLED display, Intel Core Ultra 7 processor, and all-day battery life in a sleek aluminum chassis.',
     1, 3, 159990),

    ('Dell XPS 15',
     '15.6" OLED touch, Intel i9-13900H, 32GB RAM.',
     'The Dell XPS 15 is the ultimate creative laptop — OLED display, NVIDIA RTX 4060, and premium build quality make it ideal for professionals.',
     6, 3, 189990),

    ('Sony Bravia XR A95L',
     '65" QD-OLED TV, Google TV, Cognitive Processor XR.',
     'The A95L features QD-OLED panel technology for perfect blacks and vibrant color. Cognitive Processor XR replicates how humans see and hear.',
     3, 4, 399990),

    ('LG C3 OLED',
     '55" OLED evo, α9 Gen6 AI Processor, webOS 23.',
     'LG C3 delivers cinema-grade picture quality with OLED evo technology and a 120Hz panel — the best OLED TV for gaming and movies.',
     4, 4, 149990),

    ('Sony WH-1000XM5',
     'Industry-leading noise cancellation headphones, 30hr battery.',
     'WH-1000XM5 features eight microphones and two processors for unmatched noise cancellation. Multipoint connection lets you pair two devices simultaneously.',
     3, 5, 29990);


INSERT INTO ProductAttributes (ProductId, AttributeId, Value) VALUES
    (1,1,'12'), (1,2,'256'), (1,3,'Titanium Black'), (1,4,'6.8'), (1,5,'5000'), (1,6,'Snapdragon 8 Gen 3'), (1,7,'3088x1440');

INSERT INTO ProductAttributes (ProductId, AttributeId, Value) VALUES
    (2,1,'8'), (2,2,'256'), (2,3,'Natural Titanium'), (2,4,'6.1'), (2,5,'3274'), (2,6,'A17 Pro'), (2,7,'2556x1179');


INSERT INTO ProductAttributes (ProductId, AttributeId, Value) VALUES
    (3,1,'16'), (3,2,'512'), (3,3,'Silky Black'), (3,4,'6.82'), (3,5,'5400'), (3,6,'Snapdragon 8 Gen 3'), (3,7,'3168x1440');


INSERT INTO ProductAttributes (ProductId, AttributeId, Value) VALUES
    (4,1,'16'), (4,2,'512'), (4,3,'Moonstone Gray'), (4,4,'16'), (4,5,'N/A'), (4,6,'Intel Core Ultra 7'), (4,7,'2880x1800');


INSERT INTO ProductAttributes (ProductId, AttributeId, Value) VALUES
    (5,1,'32'), (5,2,'1024'), (5,3,'Platinum Silver'), (5,4,'15.6'), (5,5,'N/A'), (5,6,'Intel Core i9-13900H'), (5,7,'3456x2160');


INSERT INTO ProductAttributes (ProductId, AttributeId, Value) VALUES
    (6,1,'N/A'), (6,2,'N/A'), (6,3,'Black'), (6,4,'65'), (6,5,'N/A'), (6,6,'Cognitive Processor XR'), (6,7,'3840x2160');


INSERT INTO ProductAttributes (ProductId, AttributeId, Value) VALUES
    (7,1,'N/A'), (7,2,'N/A'), (7,3,'Black'), (7,4,'55'), (7,5,'N/A'), (7,6,'α9 Gen6 AI Processor'), (7,7,'3840x2160');


INSERT INTO ProductAttributes (ProductId, AttributeId, Value) VALUES
    (8,1,'N/A'), (8,2,'N/A'), (8,3,'Black'), (8,4,'N/A'), (8,5,'30 hrs'), (8,6,'HD Noise Cancelling Processor QN2'), (8,7,'N/A');


INSERT INTO ProductVendors (ProductId, VendorId, Price, StockQty, StockStatus) VALUES
    (1,1,122999,50,'In Stock'), (1,2,121999,30,'In Stock'), (1,3,124999,10,'Limited');

INSERT INTO ProductVendors (ProductId, VendorId, Price, StockQty, StockStatus) VALUES
    (2,1,133900,25,'In Stock'), (2,3,134900,8,'Limited'), (2,4,132900,0,'Out of Stock');

INSERT INTO ProductVendors (ProductId, VendorId, Price, StockQty, StockStatus) VALUES
    (3,2,63999,100,'In Stock'), (3,1,64999,60,'In Stock');

INSERT INTO ProductVendors (ProductId, VendorId, Price, StockQty, StockStatus) VALUES
    (4,1,157990,20,'In Stock'), (4,5,159990,5,'Limited');

INSERT INTO ProductVendors (ProductId, VendorId, Price, StockQty, StockStatus) VALUES
    (5,1,187990,15,'In Stock'), (5,2,189990,12,'In Stock'), (5,3,189990,3,'Limited');

INSERT INTO ProductVendors (ProductId, VendorId, Price, StockQty, StockStatus) VALUES
    (6,1,399990,5,'In Stock'), (6,4,395000,2,'Limited');

INSERT INTO ProductVendors (ProductId, VendorId, Price, StockQty, StockStatus) VALUES
    (7,1,147990,20,'In Stock'), (7,2,149990,15,'In Stock'), (7,5,149990,7,'In Stock');

INSERT INTO ProductVendors (ProductId, VendorId, Price, StockQty, StockStatus) VALUES
    (8,1,28990,80,'In Stock'), (8,2,29990,50,'In Stock'), (8,3,29990,20,'In Stock');

GO