"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Edit3, Trash2, Search, X, Loader2, Package } from "lucide-react";
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/products";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  active: boolean;
  category: string;
};

export default function ClientProducts({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategoryFilter = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const [isPending, startTransition] = useTransition();
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formImage, setFormImage] = useState("");
  const [formError, setFormError] = useState("");

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormStock("0");
    setFormCategory(activeCategoryFilter || "General");
    setFormImage("");
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDesc(product.description);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    setFormCategory(product.category);
    setFormImage(product.image);
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formName || !formDesc || !formPrice) {
      setFormError("Name, Description, and Price are required.");
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Please enter a valid price.");
      return;
    }

    const formData = new FormData();
    formData.append("name", formName);
    formData.append("description", formDesc);
    formData.append("price", formPrice);
    formData.append("stock", formStock);
    formData.append("category", formCategory);
    if (formImage) {
      formData.append("image", formImage);
    }

    startTransition(async () => {
      let res;
      if (editingProduct) {
        res = await updateProduct(editingProduct.id, formData);
      } else {
        res = await createProduct(formData);
      }

      if (res.error) {
        setFormError(res.error);
      } else {
        setModalOpen(false);
        router.refresh();
        // Optimistically update or just let router refresh handle it
        if (res.product) {
          const updatedProd = res.product as Product;
          if (editingProduct) {
            setProducts(products.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
          } else {
            setProducts([updatedProd, ...products]);
          }
        }
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to deactivate/delete this product?")) return;

    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res?.error) {
        alert(res.error);
      } else {
        setProducts(products.map((p) => (p.id === id ? { ...p, active: false } : p)));
        router.refresh();
      }
    });
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategoryFilter
      ? p.category.toLowerCase() === activeCategoryFilter.toLowerCase()
      : true;

    const matchesActiveStatus =
      filterActive === "all"
        ? true
        : filterActive === "active"
        ? p.active
        : !p.active;

    return matchesSearch && matchesCategory && matchesActiveStatus;
  });

  return (
    <div className="px-4 py-6 flex flex-col gap-6 pb-16 bg-base-100 flex-1">
      {/* Title block */}
      <div className="flex flex-col gap-1 border-b border-base-300/30 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xl font-bold text-base-content tracking-wide">
              পণ্য ম্যানেজমেন্ট
            </h2>
            <p className="text-xs text-base-content/50">
              {activeCategoryFilter ? `ক্যাটাগরি: ${activeCategoryFilter}` : "সিস্টেমের সকল পণ্য পরিচালনা করুন।"}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="btn btn-sm btn-primary rounded-xl flex items-center gap-1 font-bold text-xs"
          >
            <Plus className="w-4 h-4" /> নতুন পণ্য
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-base-200 text-base-content placeholder-base-content/40 rounded-xl py-2.5 pl-4 pr-10 text-xs border border-base-300/30 focus:outline-none focus:border-primary transition-all"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-content/40 w-4 h-4" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setFilterActive("all")}
              className={`btn btn-xs rounded-lg font-bold ${
                filterActive === "all" ? "btn-secondary" : "btn-ghost text-base-content/50"
              }`}
            >
              সব ({products.length})
            </button>
            <button
              onClick={() => setFilterActive("active")}
              className={`btn btn-xs rounded-lg font-bold ${
                filterActive === "active" ? "btn-secondary" : "btn-ghost text-base-content/50"
              }`}
            >
              সক্রিয় ({products.filter((p) => p.active).length})
            </button>
            <button
              onClick={() => setFilterActive("inactive")}
              className={`btn btn-xs rounded-lg font-bold ${
                filterActive === "inactive" ? "btn-secondary" : "btn-ghost text-base-content/50"
              }`}
            >
              নিষ্ক্রিয় ({products.filter((p) => !p.active).length})
            </button>
          </div>

          {activeCategoryFilter && (
            <button
              onClick={() => router.push("/dashboard/products")}
              className="btn btn-xs btn-outline btn-error rounded-lg flex items-center gap-0.5 text-[10px] px-2 font-bold"
            >
              ফিল্টার সরান <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-base-content/40 bg-base-200 border border-base-300/20 rounded-2xl flex flex-col items-center justify-center gap-2">
            <Package className="w-8 h-8 text-base-content/20" />
            কোন পণ্য পাওয়া যায়নি
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`flex items-center gap-3.5 p-3.5 bg-base-200 border rounded-2xl relative shadow-sm hover:border-base-300 transition-all ${
                !product.active ? "opacity-60 border-dashed border-base-300" : "border-base-300/30"
              }`}
            >
              <div className="w-16 h-16 rounded-xl bg-base-300 flex-shrink-0 relative overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-extrabold">
                    {product.category}
                  </span>
                  {!product.active && (
                    <span className="text-[9px] bg-error/15 text-error px-1.5 py-0.5 rounded font-extrabold">
                      নিষ্ক্রিয়
                    </span>
                  )}
                  {product.active && product.stock === 0 && (
                    <span className="text-[9px] bg-warning/15 text-warning px-1.5 py-0.5 rounded font-extrabold">
                      আউট অব স্টক
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-base-content truncate leading-snug mt-1">
                  {product.name}
                </h4>
                <span className="text-[10px] text-base-content/50 line-clamp-1 leading-snug">
                  {product.description}
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs font-extrabold text-secondary">
                    ৳ {product.price.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-base-content/40 font-bold">
                    স্টক: {product.stock}
                  </span>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => openEditModal(product)}
                  className="btn btn-square btn-xs btn-ghost text-base-content/60 hover:text-secondary hover:bg-secondary/15"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {product.active && (
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="btn btn-square btn-xs btn-ghost text-base-content/40 hover:text-error hover:bg-error/15"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CRUD Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-base-200 border border-base-300/40 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-5 relative shadow-2xl animate-fade-in">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-base-content/40 hover:text-base-content"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-sm font-bold text-base-content mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              {editingProduct ? "পণ্য সম্পাদনা করুন" : "নতুন পণ্য যোগ করুন"}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {formError && (
                <div className="alert alert-error text-xs rounded-xl py-2 px-3 border-none text-white font-semibold">
                  {formError}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-base-content/50 uppercase pl-1">
                  পণ্যের নাম *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ১ কেজি ডাল"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input input-sm input-bordered rounded-xl bg-base-300 text-xs focus:outline-none focus:border-primary border-base-300/40"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-base-content/50 uppercase pl-1">
                  ক্যাটাগরি
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="select select-sm select-bordered rounded-xl bg-base-300 text-xs focus:outline-none focus:border-primary border-base-300/40"
                >
                  <option value="General">General</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Gas cylinder">Gas cylinder</option>
                  <option value="Fridge">Fridge</option>
                  <option value="Air Conditioner">Air Conditioner</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-base-content/50 uppercase pl-1">
                    মূল্য *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="৳ ১০০"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="input input-sm input-bordered rounded-xl bg-base-300 text-xs focus:outline-none focus:border-primary border-base-300/40"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-base-content/50 uppercase pl-1">
                    স্টক
                  </label>
                  <input
                    type="number"
                    placeholder="০"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="input input-sm input-bordered rounded-xl bg-base-300 text-xs focus:outline-none focus:border-primary border-base-300/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-base-content/50 uppercase pl-1">
                  পণ্যের বিবরণ *
                </label>
                <textarea
                  placeholder="পণ্যের সংক্ষিপ্ত বিবরণ দিন..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="textarea textarea-sm textarea-bordered rounded-xl bg-base-300 text-xs focus:outline-none focus:border-primary border-base-300/40 resize-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-base-content/50 uppercase pl-1">
                  ছবি (URL)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="input input-sm input-bordered rounded-xl bg-base-300 text-xs focus:outline-none focus:border-primary border-base-300/40"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="btn btn-sm btn-primary rounded-xl font-bold text-xs mt-3 flex items-center justify-center gap-1.5"
              >
                {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingProduct ? "পরিবর্তন সংরক্ষণ করুন" : "যোগ করুন"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
