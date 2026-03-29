
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProductFinder.API.Models;

public class Brand
{
    public int BrandId { get; set; }
    [MaxLength(100)] public string Name { get; set; } = "";
    public string? LogoUrl { get; set; }
    public ICollection<Product> Products { get; set; } = [];
}

public class Category
{
    public int CategoryId { get; set; }
    [MaxLength(100)] public string Name { get; set; } = "";
    public int? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public ICollection<Product> Products { get; set; } = [];
}

public class AttributeDefinition
{
    public int AttributeId { get; set; }
    [MaxLength(100)] public string Name { get; set; } = "";
    [MaxLength(20)]  public string DataType { get; set; } = "text"; // text | number | range
    public string? Unit { get; set; }
    public bool IsFilterable { get; set; } = true;
    public int DisplayOrder { get; set; }
    public ICollection<ProductAttribute> ProductAttributes { get; set; } = [];
}

public class Product
{
    public int ProductId { get; set; }
    [MaxLength(200)] public string Name { get; set; } = "";
    public string? ShortDescription { get; set; }
    public string? FullDescription { get; set; }
    public int BrandId { get; set; }
    public Brand Brand { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    [Column(TypeName = "decimal(18,2)")] public decimal BasePrice { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public ICollection<ProductAttribute> Attributes { get; set; } = [];
    public ICollection<ProductVendor> ProductVendors { get; set; } = [];
}

public class ProductAttribute
{
    public int ProductAttributeId { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int AttributeId { get; set; }
    public AttributeDefinition AttributeDefinition { get; set; } = null!;
    [MaxLength(200)] public string Value { get; set; } = "";
}

public class Vendor
{
    public int VendorId { get; set; }
    [MaxLength(150)] public string Name { get; set; } = "";
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<ProductVendor> ProductVendors { get; set; } = [];
}

public class ProductVendor
{
    public int ProductVendorId { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int VendorId { get; set; }
    public Vendor Vendor { get; set; } = null!;
    [Column(TypeName = "decimal(18,2)")] public decimal Price { get; set; }
    public int StockQty { get; set; }
    [MaxLength(30)] public string StockStatus { get; set; } = "In Stock";
    public string? ListingUrl { get; set; }
}
*/


public class ProductFilterRequest
{
    public List<int>? BrandIds { get; set; }
    public List<int>? CategoryIds { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    // Dynamic attribute filters: { attributeId: [value1, value2] }
    public Dictionary<int, List<string>>? AttributeFilters { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; } = "name"; // name | price | newest
}

// ── Filter Options (returned to populate left pane) ─────────
public class FilterOptionsDto
{
    public List<BrandFilterDto> Brands { get; set; } = [];
    public List<CategoryFilterDto> Categories { get; set; } = [];
    public PriceRangeDto PriceRange { get; set; } = new();
    public List<AttributeFilterDto> Attributes { get; set; } = [];
}

public record BrandFilterDto(int BrandId, string Name, int ProductCount);
public record CategoryFilterDto(int CategoryId, string Name, int ProductCount);
public record PriceRangeDto(decimal Min = 0, decimal Max = 1000000);
public class AttributeFilterDto
{
    public int AttributeId { get; set; }
    public string Name { get; set; } = "";
    public string DataType { get; set; } = "text";
    public string? Unit { get; set; }
    public List<string> Values { get; set; } = [];
}

// ── Product List ─────────────────────────────────────────────
public class PagedResult<T>
{
    public List<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}

public class ProductSummaryDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = "";
    public string BrandName { get; set; } = "";
    public string CategoryName { get; set; } = "";
    public decimal BasePrice { get; set; }
    public decimal? LowestVendorPrice { get; set; }
    public string? ShortDescription { get; set; }
    public string? ImageUrl { get; set; }
    public int VendorCount { get; set; }
    public List<KeyValuePair<string, string>> KeySpecs { get; set; } = [];
}

// ── Product Detail ───────────────────────────────────────────
public class ProductDetailDto
{
    public int ProductId { get; set; }
    public string Name { get; set; } = "";
    public string BrandName { get; set; } = "";
    public string CategoryName { get; set; } = "";
    public string? ParentCategoryName { get; set; }
    public decimal BasePrice { get; set; }
    public string? ShortDescription { get; set; }
    public string? FullDescription { get; set; }
    public string? ImageUrl { get; set; }
    public List<SpecDto> Specifications { get; set; } = [];
    public List<ProductVendorDto> Vendors { get; set; } = [];
}

public record SpecDto(string Label, string Value, string? Unit);

public class ProductVendorDto
{
    public int VendorId { get; set; }
    public string VendorName { get; set; } = "";
    public string? VendorWebsite { get; set; }
    public string? LogoUrl { get; set; }
    public decimal Price { get; set; }
    public int StockQty { get; set; }
    public string StockStatus { get; set; } = "";
    public string? ListingUrl { get; set; }
}
using Microsoft.EntityFrameworkCore;
using ProductFinder.API.Models;

namespace ProductFinder.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Brand>               Brands               => Set<Brand>();
    public DbSet<Category>            Categories           => Set<Category>();
    public DbSet<AttributeDefinition> AttributeDefinitions => Set<AttributeDefinition>();
    public DbSet<Product>             Products             => Set<Product>();
    public DbSet<ProductAttribute>    ProductAttributes    => Set<ProductAttribute>();
    public DbSet<Vendor>              Vendors              => Set<Vendor>();
    public DbSet<ProductVendor>       ProductVendors       => Set<ProductVendor>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Product>()
          .HasOne(p => p.Brand).WithMany(b => b.Products).HasForeignKey(p => p.BrandId);
        mb.Entity<Product>()
          .HasOne(p => p.Category).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId);
        mb.Entity<ProductAttribute>()
          .HasOne(pa => pa.Product).WithMany(p => p.Attributes).HasForeignKey(pa => pa.ProductId);
        mb.Entity<ProductAttribute>()
          .HasOne(pa => pa.AttributeDefinition).WithMany(a => a.ProductAttributes).HasForeignKey(pa => pa.AttributeId);
        mb.Entity<ProductVendor>()
          .HasOne(pv => pv.Product).WithMany(p => p.ProductVendors).HasForeignKey(pv => pv.ProductId);
        mb.Entity<ProductVendor>()
          .HasOne(pv => pv.Vendor).WithMany(v => v.ProductVendors).HasForeignKey(pv => pv.VendorId);
        mb.Entity<ProductVendor>()
          .HasIndex(pv => new { pv.ProductId, pv.VendorId }).IsUnique();
    }
}
using Microsoft.EntityFrameworkCore;
using ProductFinder.API.Data;
using ProductFinder.API.Models;

namespace ProductFinder.API.Repositories;

public class ProductRepository(AppDbContext db) : IProductRepository
{
    // ── Filter Options ────────────────────────────────────────
    public async Task<FilterOptionsDto> GetFilterOptionsAsync()
    {
        var activeProducts = db.Products.Where(p => p.IsActive);

        var brands = await activeProducts
            .GroupBy(p => new { p.BrandId, p.Brand.Name })
            .Select(g => new BrandFilterDto(g.Key.BrandId, g.Key.Name, g.Count()))
            .OrderBy(b => b.Name)
            .ToListAsync();

        var categories = await activeProducts
            .GroupBy(p => new { p.CategoryId, p.Category.Name })
            .Select(g => new CategoryFilterDto(g.Key.CategoryId, g.Key.Name, g.Count()))
            .OrderBy(c => c.Name)
            .ToListAsync();

        var priceRange = await activeProducts
            .GroupBy(_ => 1)
            .Select(g => new PriceRangeDto(g.Min(p => p.BasePrice), g.Max(p => p.BasePrice)))
            .FirstOrDefaultAsync() ?? new PriceRangeDto();

        var attrDefs = await db.AttributeDefinitions
            .Where(a => a.IsFilterable)
            .OrderBy(a => a.DisplayOrder)
            .ToListAsync();

        var attributes = new List<AttributeFilterDto>();
        foreach (var def in attrDefs)
        {
            var values = await db.ProductAttributes
                .Where(pa => pa.AttributeId == def.AttributeId
                          && pa.Value != "N/A"
                          && pa.Product.IsActive)
                .Select(pa => pa.Value)
                .Distinct()
                .OrderBy(v => v)
                .ToListAsync();

            if (values.Count > 0)
                attributes.Add(new AttributeFilterDto
                {
                    AttributeId = def.AttributeId,
                    Name        = def.Name,
                    DataType    = def.DataType,
                    Unit        = def.Unit,
                    Values      = values
                });
        }

        return new FilterOptionsDto
        {
            Brands     = brands,
            Categories = categories,
            PriceRange = priceRange,
            Attributes = attributes
        };
    }

    // ── Filtered + Paged Product List ────────────────────────
    public async Task<PagedResult<ProductSummaryDto>> GetProductsAsync(ProductFilterRequest req)
    {
        var query = db.Products
            .Where(p => p.IsActive)
            .Include(p => p.Brand)
            .Include(p => p.Category)
            .Include(p => p.Attributes).ThenInclude(a => a.AttributeDefinition)
            .Include(p => p.ProductVendors)
            .AsQueryable();

        if (req.BrandIds?.Count > 0)
            query = query.Where(p => req.BrandIds.Contains(p.BrandId));

        if (req.CategoryIds?.Count > 0)
            query = query.Where(p => req.CategoryIds.Contains(p.CategoryId));

        if (req.MinPrice.HasValue)
            query = query.Where(p => p.BasePrice >= req.MinPrice.Value);

        if (req.MaxPrice.HasValue)
            query = query.Where(p => p.BasePrice <= req.MaxPrice.Value);

        if (req.AttributeFilters?.Count > 0)
        {
            foreach (var (attrId, values) in req.AttributeFilters)
            {
                var localValues = values;
                var localAttrId = attrId;
                query = query.Where(p =>
                    p.Attributes.Any(a =>
                        a.AttributeId == localAttrId &&
                        localValues.Contains(a.Value)));
            }
        }

        query = req.SortBy switch
        {
            "price_asc"  => query.OrderBy(p => p.BasePrice),
            "price_desc" => query.OrderByDescending(p => p.BasePrice),
            "newest"     => query.OrderByDescending(p => p.CreatedAt),
            _            => query.OrderBy(p => p.Name)
        };

        var total = await query.CountAsync();

        var products = await query
            .Skip((req.Page - 1) * req.PageSize)
            .Take(req.PageSize)
            .ToListAsync();

        var items = products.Select(p => new ProductSummaryDto
        {
            ProductId         = p.ProductId,
            Name              = p.Name,
            BrandName         = p.Brand.Name,
            CategoryName      = p.Category.Name,
            BasePrice         = p.BasePrice,
            LowestVendorPrice = p.ProductVendors.Count > 0
                                    ? p.ProductVendors.Min(pv => pv.Price) : null,
            ShortDescription  = p.ShortDescription,
            ImageUrl          = p.ImageUrl,
            VendorCount       = p.ProductVendors.Count,
            KeySpecs          = p.Attributes
                                    .Where(a => a.Value != "N/A")
                                    .Take(4)
                                    .Select(a => new KeyValuePair<string, string>(
                                        a.AttributeDefinition.Name +
                                        (a.AttributeDefinition.Unit != null ? $" ({a.AttributeDefinition.Unit})" : ""),
                                        a.Value))
                                    .ToList()
        }).ToList();

        return new PagedResult<ProductSummaryDto>
        {
            Items      = items,
            TotalCount = total,
            Page       = req.Page,
            PageSize   = req.PageSize
        };
    }

    // ── Product Detail ────────────────────────────────────────
    public async Task<ProductDetailDto?> GetProductByIdAsync(int productId)
    {
        var p = await db.Products
            .Include(p => p.Brand)
            .Include(p => p.Category).ThenInclude(c => c.ParentCategory)
            .Include(p => p.Attributes).ThenInclude(a => a.AttributeDefinition)
            .Include(p => p.ProductVendors).ThenInclude(pv => pv.Vendor)
            .FirstOrDefaultAsync(p => p.ProductId == productId && p.IsActive);

        if (p is null) return null;

        return new ProductDetailDto
        {
            ProductId          = p.ProductId,
            Name               = p.Name,
            BrandName          = p.Brand.Name,
            CategoryName       = p.Category.Name,
            ParentCategoryName = p.Category.ParentCategory?.Name,
            BasePrice          = p.BasePrice,
            ShortDescription   = p.ShortDescription,
            FullDescription    = p.FullDescription,
            ImageUrl           = p.ImageUrl,
            Specifications     = p.Attributes
                .Where(a => a.Value != "N/A")
                .OrderBy(a => a.AttributeDefinition.DisplayOrder)
                .Select(a => new SpecDto(
                    a.AttributeDefinition.Name,
                    a.Value,
                    a.AttributeDefinition.Unit))
                .ToList(),
            Vendors = p.ProductVendors
                .OrderBy(pv => pv.Price)
                .Select(pv => new ProductVendorDto
                {
                    VendorId      = pv.VendorId,
                    VendorName    = pv.Vendor.Name,
                    VendorWebsite = pv.Vendor.Website,
                    LogoUrl       = pv.Vendor.LogoUrl,
                    Price         = pv.Price,
                    StockQty      = pv.StockQty,
                    StockStatus   = pv.StockStatus,
                    ListingUrl    = pv.ListingUrl
                }).ToList()
        };
    }
}
using Microsoft.AspNetCore.Mvc;
using ProductFinder.API.Repositories;

namespace ProductFinder.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FiltersController(IProductRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetFilterOptions()
        => Ok(await repo.GetFilterOptionsAsync());
}
using Microsoft.AspNetCore.Mvc;
using ProductFinder.API.Models;
using ProductFinder.API.Repositories;

namespace ProductFinder.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController(IProductRepository repo) : ControllerBase
{
    // POST /api/products/search
    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] ProductFilterRequest request)
        => Ok(await repo.GetProductsAsync(request));

    // GET /api/products/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await repo.GetProductByIdAsync(id);
        return product is null ? NotFound() : Ok(product);
    }
}
using Microsoft.EntityFrameworkCore;
using ProductFinder.API.Data;
using ProductFinder.API.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Allow React dev server
builder.Services.AddCors(o => o.AddPolicy("DevCors", p =>
    p.WithOrigins("http://localhost:5173", "http://localhost:3000")
     .AllowAnyMethod()
     .AllowAnyHeader()));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("DevCors");
app.MapControllers();
app.Run();
