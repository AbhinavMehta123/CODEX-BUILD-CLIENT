import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Rules from "@/components/Rules";
import Footer from "@/components/Footer";
export default function Home() {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <About/>
      <Rules/>
      <Footer/>
    </div>
  );
}
