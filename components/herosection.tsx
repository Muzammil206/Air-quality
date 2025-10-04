import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section 
      id="hero"
      className="relative h-screen flex items-center justify-center text-center text-white bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDze2wg5tHrHBD9NNRmqg5oXvgYxVPs85iUAioa79QDOUeHOv9BTVtRTbS6qgt2GxSt0q5K7COUxVkNw_yig6YHGGWFzdfNOBe7_tePSyAz2bK3Drp7AfUB2FHBebrS03K_2gODZ0Jco9c07Xch8dESCJlbUoxPEai12oVIyX6oFxq_NbuW1dgl6cGy-LH0ptGl8yTtPmC1La4jWady8TDTCRAY2tPr6nXBWmOgEvroc-kLdC35iT4WWIqlRk_a-2Dc2CnEbK8oLvA")`
      }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 px-4">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight">
          Air Quality Monitoring Platform
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
          Providing real-time environmental insights for Nigeria's cities – Powered by NASRDA (SSA Department, ECC Division).
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-primary/90 transition-colors"
        >
          <a href="#data-preview">Explore Dashboard</a>
        </Button>
      </div>
    </section>
  );
};