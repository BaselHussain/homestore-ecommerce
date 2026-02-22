export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: "new" | "sale" | "out-of-stock";
  rating: number;
  reviews: number;
  itemCode: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
  slug: string;
}

export const categories: Category[] = [
  { id: "1", name: "Household Goods", image: "/images/category-household.jpg", productCount: 245, slug: "household-goods" },
  { id: "2", name: "Gifts", image: "/images/category-gifts.jpg", productCount: 128, slug: "gifts" },
  { id: "3", name: "Toys", image: "/images/category-toys.jpg", productCount: 96, slug: "toys" },
  { id: "4", name: "Malta Souvenirs", image: "/images/category-souvenirs.jpg", productCount: 180, slug: "malta-souvenirs" },
  { id: "5", name: "Outdoor Furniture", image: "/images/category-outdoor.jpg", productCount: 72, slug: "outdoor-furniture" },
  { id: "6", name: "Special Offers", image: "/images/category-offers.jpg", productCount: 54, slug: "special-offers" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "9 Pcs Pots & Pans Set",
    price: 65.0,
    image: "/images/product-pots-set.jpg",
    category: "Household Goods",
    badge: "new",
    rating: 4.8,
    reviews: 142,
    itemCode: "8942",
  },
  {
    id: "2",
    name: "24 Pcs Cutlery Set",
    price: 22.95,
    originalPrice: 29.99,
    image: "/images/product-cutlery.jpg",
    category: "Household Goods",
    badge: "sale",
    rating: 4.5,
    reviews: 87,
    itemCode: "9067",
  },
  {
    id: "3",
    name: "Rattan Laundry Basket + Cover",
    price: 19.5,
    image: "/images/product-laundry-basket.jpg",
    category: "Household Goods",
    badge: "new",
    rating: 4.3,
    reviews: 53,
    itemCode: "9103",
  },
  {
    id: "4",
    name: "Stand Patio Heater",
    price: 530.0,
    image: "/images/product-patio-heater.jpg",
    category: "Outdoor Furniture",
    rating: 4.9,
    reviews: 29,
    itemCode: "4262",
  },
  {
    id: "5",
    name: "Child Armchair",
    price: 4.25,
    image: "/images/product-child-chair.jpg",
    category: "Toys",
    badge: "sale",
    rating: 4.1,
    reviews: 201,
    itemCode: "3441",
  },
  {
    id: "6",
    name: "Bamboo Napkin Holder",
    price: 18.0,
    image: "/images/product-napkin-holder.jpg",
    category: "Household Goods",
    rating: 4.6,
    reviews: 44,
    itemCode: "9715",
  },
  {
    id: "7",
    name: "5 Step Aluminium Ladder",
    price: 55.0,
    image: "/images/product-ladder.jpg",
    category: "Household Goods",
    badge: "new",
    rating: 4.7,
    reviews: 67,
    itemCode: "9659",
  },
  {
    id: "8",
    name: 'Tool Box Classic Line 16"',
    price: 9.5,
    image: "/images/product-toolbox.jpg",
    category: "Household Goods",
    badge: "out-of-stock",
    rating: 4.2,
    reviews: 118,
    itemCode: "9133",
  },
];
