import React from "react";
import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import Countdown from "../../components/landing/Countdown";
import Features from "../../components/landing/Features";
import TimelineSection from "../../components/landing/Timeline";
import Sponsors from "../../components/landing/Sponsors";
import Prizes from "../../components/landing/Prizes";
import FAQ from "../../components/landing/FAQ";
import CTA from "../../components/landing/CTA";
import Footer from "../../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-text-900 bg-bg font-sans selection:bg-primary selection:text-bg">
      <Navbar />
      <main>
        <Hero />
        <section className="py-12 px-6 lg:px-24 bg-bg-soft">
          <Countdown />
        </section>
        <section className="py-20 px-6 lg:px-24 bg-bg relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <Features />
        </section>
        <section className="py-20 px-6 lg:px-24 bg-bg-soft">
          <TimelineSection />
        </section>
        <Sponsors />
        <section className="py-20 px-6 lg:px-24 bg-bg-soft relative overflow-hidden">
          <Prizes />
        </section>
        <section className="py-20 px-6 lg:px-24 bg-bg">
          <FAQ />
        </section>
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
