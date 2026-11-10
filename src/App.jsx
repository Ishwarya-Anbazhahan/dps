import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import Flow from "./components/Flow.jsx";
import About from "./components/About.jsx";
import Services from "./components/Services.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";
import CallFab from "./components/CallFab.jsx";

export default function App() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <Marquee />
        <Flow />
        <About />
        <Services />
        <Contact />
      </main>
      <Footer />
      <CallFab />
    </>
  );
}
