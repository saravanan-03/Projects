import { useState, useEffect, useCallback, useRef } from "react";

// ─── API BASE URL ────────────────────────────────────────────
const API = "https://localhost:7001/api"; // adjust to your API port

// ─── MOCK DATA (for standalone demo without live API) ───────
const MOCK_FILTERS = {
  brands: [
    { brandId: 1, name: "Samsung", productCount: 3 },
    { brandId: 2, name: "Apple", productCount: 1 },
    { brandId: 3, name: "Sony", productCount: 2 },
    { brandId: 4, name: "LG", productCount: 1 },
    { brandId: 5, name: "OnePlus", productCount: 1 },
    { brandId: 6, name: "Dell", productCount: 1 },
  ],
  categories: [
    { categoryId: 2, name: "Smartphones", productCount: 3 },
    { categoryId: 3, name: "Laptops", productCount: 2 },
    { categoryId: 4, name: "Televisions", productCount: 2 },
    { categoryId: 5, name: "Audio", productCount: 1 },
  ],
  priceRange: { min: 28990, max: 399990 },
  attributes: [
    { attributeId: 1, name: "RAM", dataType: "text", unit: "GB", values: ["8", "12", "16", "32"] },
    { attributeId: 2, name: "Storage", dataType: "text", unit: "GB", values: ["256", "512", "1024"] },
    { attributeId: 3, name: "Color", dataType: "text", unit: null, values: ["Black", "Titanium Black", "Natural Titanium", "Silky Black", "Moonstone Gray", "Platinum Silver"] },
    { attributeId: 6, name: "Processor", dataType: "text", unit: null, values: ["A17 Pro", "Intel Core i9-13900H", "Intel Core Ultra 7", "Snapdragon 8 Gen 3"] },
  ],
};

const MOCK_PRODUCTS = {
  items: [
    { productId: 1, name: "Samsung Galaxy S24 Ultra", brandName: "Samsung", categoryName: "Smartphones", basePrice: 124999, lowestVendorPrice: 121999, shortDescription: "6.8\" QHD+ Dynamic AMOLED, 200MP camera, S-Pen included.", vendorCount: 3, imageUrl: null, keySpecs: [["RAM (GB)", "12"], ["Storage (GB)", "256"], ["Color", "Titanium Black"], ["Screen Size (inch)", "6.8"]] },
    { productId: 2, name: "Apple iPhone 15 Pro", brandName: "Apple", categoryName: "Smartphones", basePrice: 134900, lowestVendorPrice: 132900, shortDescription: "6.1\" Super Retina XDR, A17 Pro chip, Titanium design.", vendorCount: 3, imageUrl: null, keySpecs: [["RAM (GB)", "8"], ["Storage (GB)", "256"], ["Color", "Natural Titanium"], ["Screen Size (inch)", "6.1"]] },
    { productId: 3, name: "OnePlus 12", brandName: "OnePlus", categoryName: "Smartphones", basePrice: 64999, lowestVendorPrice: 63999, shortDescription: "6.82\" LTPO AMOLED, Snapdragon 8 Gen 3, 100W charging.", vendorCount: 2, imageUrl: null, keySpecs: [["RAM (GB)", "16"], ["Storage (GB)", "512"], ["Color", "Silky Black"], ["Battery (mAh)", "5400"]] },
    { productId: 4, name: "Samsung Galaxy Book4 Pro", brandName: "Samsung", categoryName: "Laptops", basePrice: 159990, lowestVendorPrice: 157990, shortDescription: "16\" AMOLED laptop, Intel Core Ultra 7, 16GB RAM.", vendorCount: 2, imageUrl: null, keySpecs: [["RAM (GB)", "16"], ["Storage (GB)", "512"], ["Processor", "Intel Core Ultra 7"], ["Screen Size (inch)", "16"]] },
    { productId: 5, name: "Dell XPS 15", brandName: "Dell", categoryName: "Laptops", basePrice: 189990, lowestVendorPrice: 187990, shortDescription: "15.6\" OLED touch, Intel i9-13900H, 32GB RAM.", vendorCount: 3, imageUrl: null, keySpecs: [["RAM (GB)", "32"], ["Storage (GB)", "1024"], ["Processor", "Intel Core i9-13900H"], ["Screen Size (inch)", "15.6"]] },
    { productId: 6, name: "Sony Bravia XR A95L", brandName: "Sony", categoryName: "Televisions", basePrice: 399990, lowestVendorPrice: 395000, shortDescription: "65\" QD-OLED TV, Google TV, Cognitive Processor XR.", vendorCount: 2, imageUrl: null, keySpecs: [["Color", "Black"], ["Screen Size (inch)", "65"], ["Processor", "Cognitive Processor XR"], ["Resolution", "3840x2160"]] },
    { productId: 7, name: "LG C3 OLED", brandName: "LG", categoryName: "Televisions", basePrice: 149990, lowestVendorPrice: 147990, shortDescription: "55\" OLED evo, α9 Gen6 AI Processor, webOS 23.", vendorCount: 3, imageUrl: null, keySpecs: [["Color", "Black"], ["Screen Size (inch)", "55"], ["Resolution", "3840x2160"]] },
    { productId: 8, name: "Sony WH-1000XM5", brandName: "Sony", categoryName: "Audio", basePrice: 29990, lowestVendorPrice: 28990, shortDescription: "Industry-leading noise cancellation headphones, 30hr battery.", vendorCount: 3, imageUrl: null, keySpecs: [["Color", "Black"], ["Battery (mAh)", "30 hrs"]] },
  ],
  totalCount: 8,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

const MOCK_PRODUCT_DETAILS = {
  1: { productId: 1, name: "Samsung Galaxy S24 Ultra", brandName: "Samsung", categoryName: "Smartphones", parentCategoryName: "Electronics", basePrice: 124999, shortDescription: "6.8\" QHD+ Dynamic AMOLED, 200MP camera, S-Pen included.", fullDescription: "The Galaxy S24 Ultra redefines what a smartphone can do. Featuring a 200MP main camera, built-in S-Pen, and Snapdragon 8 Gen 3 processor, it is the pinnacle of Android engineering. With 12GB RAM, 256GB storage, and a massive 5000mAh battery, the S24 Ultra handles everything from intensive gaming to creative photography with ease.", specifications: [{ label: "RAM", value: "12", unit: "GB" }, { label: "Storage", value: "256", unit: "GB" }, { label: "Color", value: "Titanium Black", unit: null }, { label: "Screen Size", value: "6.8", unit: "inch" }, { label: "Battery", value: "5000", unit: "mAh" }, { label: "Processor", value: "Snapdragon 8 Gen 3", unit: null }, { label: "Resolution", value: "3088x1440", unit: null }], vendors: [{ vendorId: 2, vendorName: "Flipkart", price: 121999, stockQty: 30, stockStatus: "In Stock", listingUrl: null }, { vendorId: 1, vendorName: "Amazon", price: 122999, stockQty: 50, stockStatus: "In Stock" }, { vendorId: 3, vendorName: "Croma", price: 124999, stockQty: 10, stockStatus: "Limited" }] },
  2: { productId: 2, name: "Apple iPhone 15 Pro", brandName: "Apple", categoryName: "Smartphones", parentCategoryName: "Electronics", basePrice: 134900, shortDescription: "6.1\" Super Retina XDR, A17 Pro chip, Titanium design.", fullDescription: "iPhone 15 Pro features the A17 Pro chip with a 6-core GPU, USB 3 speeds, and a customizable Action button — all in aerospace-grade titanium. The 48MP main camera supports 4K video at 60fps with Apple ProRes.", specifications: [{ label: "RAM", value: "8", unit: "GB" }, { label: "Storage", value: "256", unit: "GB" }, { label: "Color", value: "Natural Titanium", unit: null }, { label: "Screen Size", value: "6.1", unit: "inch" }, { label: "Battery", value: "3274", unit: "mAh" }, { label: "Processor", value: "A17 Pro", unit: null }], vendors: [{ vendorId: 4, vendorName: "Reliance Digital", price: 132900, stockQty: 0, stockStatus: "Out of Stock" }, { vendorId: 1, vendorName: "Amazon", price: 133900, stockQty: 25, stockStatus: "In Stock" }, { vendorId: 3, vendorName: "Croma", price: 134900, stockQty: 8, stockStatus: "Limited" }] },
  3: { productId: 3, name: "OnePlus 12", brandName: "OnePlus", categoryName: "Smartphones", parentCategoryName: "Electronics", basePrice: 64999, shortDescription: "6.82\" LTPO AMOLED, Snapdragon 8 Gen 3, 100W charging.", fullDescription: "OnePlus 12 combines flagship performance with ultra-fast 100W SUPERVOOC charging. Its Hasselblad-tuned triple camera system and 5400 mAh battery make it a powerhouse for all-day use.", specifications: [{ label: "RAM", value: "16", unit: "GB" }, { label: "Storage", value: "512", unit: "GB" }, { label: "Color", value: "Silky Black", unit: null }, { label: "Screen Size", value: "6.82", unit: "inch" }, { label: "Battery", value: "5400", unit: "mAh" }, { label: "Processor", value: "Snapdragon 8 Gen 3", unit: null }], vendors: [{ vendorId: 2, vendorName: "Flipkart", price: 63999, stockQty: 100, stockStatus: "In Stock" }, { vendorId: 1, vendorName: "Amazon", price: 64999, stockQty: 60, stockStatus: "In Stock" }] },
};

// ─── UTILITIES ───────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const categoryEmoji = { "Smartphones": "📱", "Laptops": "💻", "Televisions": "📺", "Audio": "🎧" };
const brandColor = { Samsung: "#1428A0", Apple: "#555", Sony: "#000", LG: "#A50034", OnePlus: "#F5010C", Dell: "#007DB8", HP: "#0096D6" };

// ─── PLACEHOLDER PRODUCT IMAGE ───────────────────────────────
function ProductImage({ name, category, size = 200 }) {
  const emoji = categoryEmoji[category] || "📦";
  return (
    <div style={{ width: size, height: size, background: "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: 12, fontSize: size * 0.35, userSelect: "none" }}>
      <span>{emoji}</span>
    </div>
  );
}

// ─── CHIP COMPONENT ──────────────────────────────────────────
function Chip({ label, onRemove }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", color: "#6366F1", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}>✕</button>
    </span>
  );
}

// ─── STOCK BADGE ─────────────────────────────────────────────
function StockBadge({ status }) {
  const map = { "In Stock": ["#D1FAE5", "#065F46"], "Limited": ["#FEF3C7", "#92400E"], "Out of Stock": ["#FEE2E2", "#991B1B"], "Pre-Order": ["#E0E7FF", "#3730A3"] };
  const [bg, color] = map[status] || ["#F3F4F6", "#374151"];
  return <span style={{ background: bg, color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>{status}</span>;
}

// ─── FILTER SECTION ──────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: 16, marginBottom: 16 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: "4px 0", fontFamily: "inherit" }}>
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#64748B" }}>{title}</span>
        <span style={{ color: "#94A3B8", fontSize: 16, transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }}>⌃</span>
      </button>
      {open && <div style={{ marginTop: 10 }}>{children}</div>}
    </div>
  );
}

function CheckboxItem({ label, checked, onChange, count }) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, cursor: "pointer", padding: "4px 0", fontSize: 13, color: checked ? "#4338CA" : "#374151" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: "#6366F1", width: 15, height: 15 }} />
        <span style={{ fontWeight: checked ? 600 : 400 }}>{label}</span>
      </span>
      {count !== undefined && <span style={{ fontSize: 11, color: "#94A3B8", background: "#F8FAFC", borderRadius: 10, padding: "1px 7px" }}>{count}</span>}
    </label>
  );
}

// ─── LEFT PANE: FILTER PANEL ─────────────────────────────────
function FilterPanel({ filters, selected, onChange, onClear }) {
  if (!filters) return <div style={{ padding: 20, color: "#94A3B8", fontSize: 13 }}>Loading filters…</div>;

  const toggle = (type, id) => {
    const cur = selected[type] || [];
    const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    onChange({ ...selected, [type]: next });
  };

  const toggleAttr = (attrId, value) => {
    const cur = (selected.attributes || {})[attrId] || [];
    const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
    onChange({ ...selected, attributes: { ...(selected.attributes || {}), [attrId]: next } });
  };

  return (
    <aside style={{ width: 260, flexShrink: 0, background: "#FFFFFF", borderRight: "1px solid #F1F5F9", padding: "20px 20px", height: "100%", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A", fontFamily: "'DM Sans', sans-serif" }}>Filters</h2>
        <button onClick={onClear} style={{ background: "none", border: "none", color: "#6366F1", fontSize: 12, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Clear all</button>
      </div>

      <FilterSection title="Brand">
        {filters.brands.map(b => (
          <CheckboxItem key={b.brandId} label={b.name} count={b.productCount} checked={(selected.brands || []).includes(b.brandId)} onChange={() => toggle("brands", b.brandId)} />
        ))}
      </FilterSection>

      <FilterSection title="Category">
        {filters.categories.map(c => (
          <CheckboxItem key={c.categoryId} label={`${categoryEmoji[c.name] || ""} ${c.name}`} count={c.productCount} checked={(selected.categories || []).includes(c.categoryId)} onChange={() => toggle("categories", c.categoryId)} />
        ))}
      </FilterSection>

      <FilterSection title="Price Range">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="number" placeholder={`Min`} value={selected.minPrice || ""} onChange={e => onChange({ ...selected, minPrice: e.target.value ? +e.target.value : undefined })}
            style={{ width: "50%", padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12, fontFamily: "inherit" }} />
          <span style={{ color: "#CBD5E1" }}>–</span>
          <input type="number" placeholder={`Max`} value={selected.maxPrice || ""} onChange={e => onChange({ ...selected, maxPrice: e.target.value ? +e.target.value : undefined })}
            style={{ width: "50%", padding: "6px 10px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12, fontFamily: "inherit" }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "#94A3B8" }}>{fmt(filters.priceRange.min)} – {fmt(filters.priceRange.max)}</div>
      </FilterSection>

      {filters.attributes.map(attr => (
        <FilterSection key={attr.attributeId} title={`${attr.name}${attr.unit ? ` (${attr.unit})` : ""}`} defaultOpen={attr.attributeId <= 2}>
          {attr.values.map(v => (
            <CheckboxItem key={v} label={v} checked={((selected.attributes || {})[attr.attributeId] || []).includes(v)} onChange={() => toggleAttr(attr.attributeId, v)} />
          ))}
        </FilterSection>
      ))}
    </aside>
  );
}

// ─── SELECTED FILTER CHIPS ───────────────────────────────────
function SelectedChips({ selected, filters, onChange }) {
  const chips = [];

  if (filters) {
    (selected.brands || []).forEach(id => {
      const b = filters.brands.find(x => x.brandId === id);
      if (b) chips.push({ key: `brand-${id}`, label: `Brand: ${b.name}`, remove: () => onChange({ ...selected, brands: selected.brands.filter(x => x !== id) }) });
    });
    (selected.categories || []).forEach(id => {
      const c = filters.categories.find(x => x.categoryId === id);
      if (c) chips.push({ key: `cat-${id}`, label: `Category: ${c.name}`, remove: () => onChange({ ...selected, categories: selected.categories.filter(x => x !== id) }) });
    });
    if (selected.minPrice) chips.push({ key: "minp", label: `Min: ${fmt(selected.minPrice)}`, remove: () => onChange({ ...selected, minPrice: undefined }) });
    if (selected.maxPrice) chips.push({ key: "maxp", label: `Max: ${fmt(selected.maxPrice)}`, remove: () => onChange({ ...selected, maxPrice: undefined }) });

    Object.entries(selected.attributes || {}).forEach(([attrId, values]) => {
      const attr = filters.attributes.find(a => a.attributeId === +attrId);
      (values || []).forEach(v => chips.push({
        key: `attr-${attrId}-${v}`,
        label: `${attr?.name || "Attr"}: ${v}`,
        remove: () => {
          const next = (values).filter(x => x !== v);
          onChange({ ...selected, attributes: { ...selected.attributes, [attrId]: next } });
        }
      }));
    });
  }

  if (chips.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
      {chips.map(c => <Chip key={c.key} label={c.label} onRemove={c.remove} />)}
    </div>
  );
}

// ─── PRODUCT CARD ────────────────────────────────────────────
function ProductCard({ product, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={() => onClick(product.productId)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "#FFF", border: `1px solid ${hovered ? "#C7D2FE" : "#F1F5F9"}`, borderRadius: 16, padding: 20, cursor: "pointer", transition: "all .2s", transform: hovered ? "translateY(-3px)" : "none", boxShadow: hovered ? "0 8px 30px rgba(99,102,241,.12)" : "0 1px 4px rgba(0,0,0,.04)", display: "flex", gap: 16 }}>
      <div style={{ flexShrink: 0 }}>
        <ProductImage name={product.name} category={product.categoryName} size={90} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 2 }}>{product.brandName} · {product.categoryName}</div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A", lineHeight: 1.3, fontFamily: "'DM Sans', sans-serif" }}>{product.name}</h3>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1E293B" }}>{fmt(product.lowestVendorPrice || product.basePrice)}</div>
            {product.lowestVendorPrice && product.lowestVendorPrice < product.basePrice && (
              <div style={{ fontSize: 11, color: "#94A3B8", textDecoration: "line-through" }}>{fmt(product.basePrice)}</div>
            )}
          </div>
        </div>
        <p style={{ margin: "6px 0 10px", fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{product.shortDescription}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {(product.keySpecs || []).map(([k, v]) => (
            <span key={k} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#475569" }}>
              <b>{k.split(" ")[0]}:</b> {v}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#6366F1", fontWeight: 600 }}>🏪 Available from {product.vendorCount} vendor{product.vendorCount !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}

// ─── PRODUCT LIST PAGE ───────────────────────────────────────
function ProductListPage({ onProductClick }) {
  const [filters, setFilters] = useState(null);
  const [selected, setSelected] = useState({ brands: [], categories: [], attributes: {} });
  const [products, setProducts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const debounceRef = useRef(null);

  // Load filter options
  useEffect(() => {
    fetch(`${API}/filters`)
      .then(r => r.json())
      .then(setFilters)
      .catch(() => setFilters(MOCK_FILTERS));
  }, []);

  // Search products whenever filters change
  const doSearch = useCallback((sel, sort, pg) => {
    setLoading(true);
    const body = {
      brandIds: sel.brands?.length ? sel.brands : null,
      categoryIds: sel.categories?.length ? sel.categories : null,
      minPrice: sel.minPrice || null,
      maxPrice: sel.maxPrice || null,
      attributeFilters: Object.keys(sel.attributes || {}).reduce((acc, k) => {
        if (sel.attributes[k]?.length) acc[k] = sel.attributes[k];
        return acc;
      }, {}),
      sortBy: sort,
      page: pg,
      pageSize: 20,
    };
    fetch(`${API}/products/search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => {
        // filter mock data locally
        let items = [...MOCK_PRODUCTS.items];
        if (body.brandIds?.length) items = items.filter(p => body.brandIds.some(id => MOCK_FILTERS.brands.find(b => b.brandId === id)?.name === p.brandName));
        if (body.categoryIds?.length) items = items.filter(p => body.categoryIds.some(id => MOCK_FILTERS.categories.find(c => c.categoryId === id)?.name === p.categoryName));
        if (body.minPrice) items = items.filter(p => (p.lowestVendorPrice || p.basePrice) >= body.minPrice);
        if (body.maxPrice) items = items.filter(p => (p.lowestVendorPrice || p.basePrice) <= body.maxPrice);
        Object.entries(body.attributeFilters || {}).forEach(([attrId, values]) => {
          const attr = MOCK_FILTERS.attributes.find(a => a.attributeId === +attrId);
          if (!attr) return;
          items = items.filter(p => {
            const spec = p.keySpecs?.find(([k]) => k.startsWith(attr.name));
            return spec && values.includes(spec[1]);
          });
        });
        setProducts({ ...MOCK_PRODUCTS, items, totalCount: items.length });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(selected, sortBy, page), 300);
  }, [selected, sortBy, page, doSearch]);

  const handleFilterChange = (next) => { setSelected(next); setPage(1); };
  const handleClear = () => { setSelected({ brands: [], categories: [], attributes: {} }); setPage(1); };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", overflow: "hidden" }}>
      <FilterPanel filters={filters} selected={selected} onChange={handleFilterChange} onClear={handleClear} />

      {/* Right pane */}
      <main style={{ flex: 1, overflowY: "auto", padding: "24px 28px", background: "#F8FAFC" }}>
        <div style={{ marginBottom: 16 }}>
          <SelectedChips selected={selected} filters={filters} onChange={handleFilterChange} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#64748B" }}>
              {products ? <><b style={{ color: "#0F172A" }}>{products.totalCount}</b> products found</> : "Loading…"}
            </span>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
              style={{ padding: "6px 12px", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 13, background: "#FFF", fontFamily: "inherit", color: "#374151", cursor: "pointer" }}>
              <option value="name">Name A–Z</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div style={{ width: 36, height: 36, border: "3px solid #E2E8F0", borderTopColor: "#6366F1", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        )}

        {!loading && products && products.items.length === 0 && (
          <div style={{ textAlign: "center", padding: 80, color: "#94A3B8" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#64748B" }}>No products match your filters</p>
            <button onClick={handleClear} style={{ marginTop: 12, padding: "8px 20px", background: "#6366F1", color: "#FFF", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Clear filters</button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {!loading && products?.items.map(p => (
            <ProductCard key={p.productId} product={p} onClick={onProductClick} />
          ))}
        </div>

        {products && products.totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
            {Array.from({ length: products.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid", borderColor: p === page ? "#6366F1" : "#E2E8F0", background: p === page ? "#6366F1" : "#FFF", color: p === page ? "#FFF" : "#374151", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{p}</button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── PRODUCT DETAIL PAGE ─────────────────────────────────────
function ProductDetailPage({ productId, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/products/${productId}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false); })
      .catch(() => {
        setDetail(MOCK_PRODUCT_DETAILS[productId] || null);
        setLoading(false);
      });
  }, [productId]);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTopColor: "#6366F1", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
    </div>
  );

  if (!detail) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p style={{ color: "#64748B" }}>Product not found.</p>
      <button onClick={onBack} style={{ marginTop: 12, padding: "8px 20px", background: "#6366F1", color: "#FFF", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
    </div>
  );

  const minVendorPrice = detail.vendors.length ? Math.min(...detail.vendors.map(v => v.price)) : null;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#6366F1", cursor: "pointer", fontSize: 14, fontWeight: 600, marginBottom: 20, padding: 0, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
        ← Back to results
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 32, marginBottom: 36 }}>
        <div>
          <ProductImage name={detail.name} category={detail.categoryName} size={260} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 6 }}>
            {detail.parentCategoryName && `${detail.parentCategoryName} › `}{detail.categoryName}
          </div>
          <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 800, color: "#0F172A", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.25 }}>{detail.name}</h1>
          <div style={{ fontSize: 14, color: "#64748B", marginBottom: 16 }}>by <span style={{ fontWeight: 700, color: brandColor[detail.brandName] || "#374151" }}>{detail.brandName}</span></div>

          <div style={{ marginBottom: 16 }}>
            {minVendorPrice && <div style={{ fontSize: 28, fontWeight: 800, color: "#0F172A" }}>From {fmt(minVendorPrice)}</div>}
            <div style={{ fontSize: 13, color: "#94A3B8" }}>Available from {detail.vendors.length} vendor{detail.vendors.length !== 1 ? "s" : ""}</div>
          </div>

          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: "0 0 20px" }}>{detail.fullDescription || detail.shortDescription}</p>
        </div>
      </div>

      {/* Specifications */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 14px", fontFamily: "'DM Sans', sans-serif" }}>Specifications</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
          {detail.specifications.map(s => (
            <div key={s.label} style={{ background: "#FFF", border: "1px solid #F1F5F9", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1E293B" }}>{s.value}{s.unit ? ` ${s.unit}` : ""}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Vendors */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 14px", fontFamily: "'DM Sans', sans-serif" }}>Where to Buy</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {detail.vendors.map(v => (
            <div key={v.vendorId} style={{ background: "#FFF", border: "1px solid #F1F5F9", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, background: "#F8FAFC", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏪</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{v.vendorName}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>Stock: {v.stockQty > 0 ? `${v.stockQty} units` : "—"} &nbsp;<StockBadge status={v.stockStatus} /></div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>{fmt(v.price)}</div>
                <button style={{ padding: "7px 18px", background: v.stockStatus === "Out of Stock" ? "#F1F5F9" : "#6366F1", color: v.stockStatus === "Out of Stock" ? "#94A3B8" : "#FFF", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: v.stockStatus === "Out of Stock" ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                  disabled={v.stockStatus === "Out of Stock"}>
                  {v.stockStatus === "Out of Stock" ? "Unavailable" : "Buy Now →"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── APP SHELL ───────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("list"); // "list" | "detail"
  const [selectedId, setSelectedId] = useState(null);

  const openProduct = (id) => { setSelectedId(id); setPage("detail"); window.scrollTo(0, 0); };
  const goBack = () => { setPage("list"); setSelectedId(null); };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F8FAFC; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <header style={{ height: 60, background: "#FFF", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", padding: "0 28px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,.04)" }}>
        <button onClick={goBack} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366F1, #818CF8)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔍</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", fontFamily: "'DM Sans', sans-serif", letterSpacing: -0.5 }}>ProductFinder</span>
        </button>
        {page === "detail" && (
          <nav style={{ marginLeft: 20, fontSize: 13, color: "#94A3B8", display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={goBack} style={{ background: "none", border: "none", color: "#6366F1", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>Products</button>
            <span>›</span>
            <span style={{ color: "#475569" }}>Product Detail</span>
          </nav>
        )}
        <div style={{ marginLeft: "auto", fontSize: 12, color: "#94A3B8" }}>Powered by ASP.NET Core + React</div>
      </header>

      {page === "list" && <ProductListPage onProductClick={openProduct} />}
      {page === "detail" && <ProductDetailPage productId={selectedId} onBack={goBack} />}
    </div>
  );
}
