import ProjectEstimator from "@/components/organisms/estimator/ProjectEstimator";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Project Estimator | Devix",
  description:
    "Answer a few questions to get an instant cost estimation for your E-Commerce, Web App, or Company Profile project.",
  alternates: {
    canonical: "/estimator",
  },
};

export default function EstimatorPage() {
  return (
    <div className="grain-overlay text-black-1 relative min-h-screen bg-white">
      {/* Decorative Glows */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="bg-accent/10 absolute -top-[10%] left-[10%] h-[600px] w-[600px] rounded-full blur-[150px]" />
        <div className="absolute top-[30%] right-[5%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col pt-28 pb-16 md:pt-36 md:pb-24">
        <ProjectEstimator />
      </div>
    </div>
  );
}
