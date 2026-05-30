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
    <div className="min-h-screen text-white bg-[#050505] font-sans selection:bg-primary selection:text-bg">
      <Navbar />
      <main>
        <Hero />
        <section className="px-6 lg:px-24">
          <Countdown />
        </section>
        <div className="section-divider" />
        <section className="px-6 lg:px-24">
          <Features />
        </section>
        <div className="section-divider" />
        <section className="px-6 lg:px-24">
          <TimelineSection />
        </section>
        <div className="section-divider" />
        <Sponsors />
        <div className="section-divider" />
        <section className="px-6 lg:px-24">
          <Prizes />
        </section>
        <div className="section-divider" />
        <section className="px-6 lg:px-24">
          <FAQ />
        </section>
        <div className="section-divider" />
        <CTA />
        <Footer />
      </main>
    </div>
  );
}
