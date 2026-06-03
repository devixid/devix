import { Text } from "@/components/atoms";
import { cn } from "@/utils";
import { Monitor, ShoppingCart, Target } from "lucide-react";

export default function Offering() {
  const services = [
    {
      icon: <Monitor className="w-8 h-8 text-white" />,
      title: "Custom Web Development",
      description:
        "High-performance websites designed from scratch to deliver speed, security, and premium aesthetics for your business.",
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-white" />,
      title: "E-Commerce Solutions",
      description:
        "Tailored online shops with seamless checkout flows, secure payment integrations, and easy product management systems.",
    },
    {
      icon: <Target className="w-8 h-8 text-white" />,
      title: "Landing Page Optimization",
      description:
        "High-converting single-page sites built specifically to drive leads, showcase product launches, and maximize marketing ROI.",
    },
  ];

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center bg-black text-white py-16 md:py-24 scroll-mt-24"
      id="services"
    >
      <div className="w-full max-w-5xl px-10 md:px-0 flex flex-col items-start gap-y-12">
        <div className="flex flex-col gap-y-6 max-w-3xl">
          <Text.p className="text-zinc-500 font-medium uppercase tracking-wider text-sm">
            What We Do
          </Text.p>
          <h2 className="text-4xl md:text-6xl font-light leading-tight text-white">
            We offer website creation tailored to your unique business needs.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-start p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300 overflow-hidden"
            >
              {/* Subtle hover background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="mb-6 p-4 rounded-xl bg-zinc-800/80 group-hover:bg-zinc-800 group-hover:scale-110 transition-all duration-300 relative z-10">
                {service.icon}
              </div>
              <h3 className="text-xl font-medium mb-3 text-white relative z-10 group-hover:text-amber-400 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed relative z-10">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
