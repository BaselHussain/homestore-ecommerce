import { Truck, RotateCcw, Shield, Headphones } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Delivery", desc: "On all orders over €50" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day hassle-free returns" },
  { icon: Shield, title: "Secure Payment", desc: "100% protected transactions" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated customer care" },
];

const FeatureBar = () => (
  <section className="border-y border-border bg-card py-8">
    <div className="container mx-auto px-4 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      {features.map((f) => (
        <div key={f.title} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
            <f.icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">{f.title}</div>
            <div className="text-xs text-muted-foreground">{f.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default FeatureBar;
