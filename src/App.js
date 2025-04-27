import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import "./App.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sendContactEmail } from "./api/contactApi";

const Section = ({ children, className, id }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } 
    // else {
    //   controls.start("hidden");
    // }
  }, [isInView, controls]);

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, scale: 0.8, rotateY: 30, filter: "blur(5px)" },
        visible: {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          filter: "blur(0px)",
          transition: {
            duration: 1.2,
            ease: "easeOut",
            staggerChildren: 0.3,
          },
        },
      }}
    >
      {children}{" "}
    </motion.section>
  );
};

const App = () => {
  const logoRef = useRef(null);
  const headlineRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  useEffect(() => {
    const logo = logoRef.current;
    const headline = headlineRef.current;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      let scale = 1;
      let logoOpacity = 1;
      let headlineOpacity = 1;
      let headlineTranslateZ = 20;
      let logoTranslateZ = 100;

      if (scrollY >= windowHeight && scrollY < 2 * windowHeight) {
        const progress = (scrollY - windowHeight) / windowHeight;
        scale = 1 + progress * 2; // Zoom in for StudyUnify
        logoOpacity = Math.max(0, 1 - progress); // Fade out StudyUnify completely
        headlineOpacity = Math.max(0.2, 1 - progress * 1.2); // Fade to 20% opacity for headline
        headlineTranslateZ = 20 - progress * 50; // Move headline further back
        logoTranslateZ = 100 + progress * 50; // Move StudyUnify forward
      } else if (scrollY >= 2 * windowHeight) {
        scale = 3;
        logoOpacity = 0;
        headlineOpacity = 0.2;
        headlineTranslateZ = -30;
        logoTranslateZ = 150;
      }

      if (logo) {
        logo.style.transform = `translate(-50%, -50%) scale(${scale}) translateZ(${logoTranslateZ}px)`;
        logo.style.opacity = logoOpacity;
      }
      if (headline) {
        headline.style.opacity = headlineOpacity;
        headline.style.transform = `translateZ(${headlineTranslateZ}px)`;
      }

      // Highlight active section in header
      const sections = document.querySelectorAll("section");
      let currentSection = "intro";

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);

    // Initialize VanillaTilt for cards
    if (window.VanillaTilt) {
      window.VanillaTilt.init(
        document.querySelectorAll(".feature, .step, .review, .plan, .faq-item"),
        {
          max: 15,
          speed: 400,
          glare: true,
          "max-glare": 0.3,
        }
      );
    }

    // Animate cards on scroll
    const animateElementsOnScroll = () => {
      const elements = document.querySelectorAll(
        ".feature, .step, .review, .plan, .faq-item"
      );
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top <= windowHeight && rect.bottom >= 0) {
          el.classList.add("in-view");
        }
      });
    };

    window.addEventListener("scroll", animateElementsOnScroll);
    window.addEventListener("load", animateElementsOnScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", animateElementsOnScroll);
      window.removeEventListener("load", animateElementsOnScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // submit validation
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (validateForm()) {
  //     console.log("Form Submitted", formData);
  //     // alert("Form submitted successfully!");

  //     // Reset form after submission
  //     setFormData({ name: "", email: "", message: "" });
  //     setErrors({});

  //     // Redirect to home page
  //     window.location.href = "/";
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

  let newErrors = {};
  if (!formData.name) newErrors.name = "Name is required";
  if (!formData.email) newErrors.email = "Email is required";
  if (!formData.message) newErrors.message = "Message is required";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  const response = await sendContactEmail(formData);

  if (response.success) {
    toast.success(response.message);
    setFormData({ name: "", email: "", message: "" }); // Clear form after success
  } else {
    toast.error(response.message);
  }
};


  return (
    <div className="app">
      {" "}
      {/* Load VanillaTilt.js */}{" "}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.7.0/vanilla-tilt.min.js">
        {" "}
      </script>
      <nav className="navbar">
        <button className="hamburger" onClick={toggleMenu}>
          {" "}
          {isMenuOpen ? "X" : "☰"}
        </button>{" "}
        <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <a
            href="#intro"
            className={activeSection === "intro" ? "active" : ""}
          >
            {" "}
            Intro{" "}
          </a>{" "}
          <a href="#home" className={activeSection === "home" ? "active" : ""}>
            {" "}
            Home{" "}
          </a>{" "}
          <a
            href="#features"
            className={activeSection === "features" ? "active" : ""}
          >
            {" "}
            Features{" "}
          </a>{" "}
          <a
            href="#how-it-works"
            className={activeSection === "how-it-works" ? "active" : ""}
          >
            {" "}
            How It Works{" "}
          </a>{" "}
          <a
            href="#testimonials"
            className={activeSection === "testimonials" ? "active" : ""}
          >
            {" "}
            Testimonials{" "}
          </a>{" "}
          <a
            href="#pricing"
            className={activeSection === "pricing" ? "active" : ""}
          >
            {" "}
            Pricing{" "}
          </a>{" "}
          <a href="#faq" className={activeSection === "faq" ? "active" : ""}>
            {" "}
            FAQ{" "}
          </a>{" "}
          <a
            href="#contact"
            className={activeSection === "contact" ? "active" : ""}
          >
            {" "}
            Contact{" "}
          </a>{" "}
        </div>{" "}
      </nav>
      {/* Intro Section (Headline + StudyUnify Logo) */}{" "}
      <Section id="intro" className="intro">
        <motion.div
          className="intro-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="headline" ref={headlineRef}>
            {" "}
            Unify Your Learning Journey{" "}
          </div>{" "}
          <div className="logo" ref={logoRef}>
            {" "}
            StudyUnify{" "}
          </div>{" "}
        </motion.div>{" "}
      </Section>
      {/* Home Section (Description + Buttons) */}{" "}
      <Section id="home" className="home">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          Simplify your studies with a powerful app designed to keep you
          organized and ahead.{" "}
        </motion.p>{" "}
        <motion.div
          className="cta-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <motion.button
            className="cta"
            whileHover={{ scale: 1.1, opacity: 0.9 }}
            whileTap={{ scale: 0.95 }}
          >
            Download Now{" "}
          </motion.button>{" "}
          {/* <motion.button
            className="cta secondary"
            whileHover={{ scale: 1.1, opacity: 0.9 }}
            whileTap={{ scale: 0.95 }}
          >
            Try for Free{" "}
          </motion.button>{" "} */}
        </motion.div>{" "}
      </Section>
      {/* Features Section */}{" "}
      <Section id="features" className="features">
        <h1> Features & Benefits </h1>{" "}
        <div className="feature-list">
          <div className="feature">
            <h3> Attendance Management</h3>{" "}
            <p id="special-p" >
              {" "}
              Say goodbye to manual roll calls! Our automated attendance
              tracking sends instant notifications to parents for absences and
              generates detailed attendance reports to identify patterns.{" "}
            </p>{" "}
          </div>{" "}
          <div className="feature">
            <h3>Test Scheduling</h3>{" "}
            <p id="special-p">
              {" "}
              Plan and organize tests effortlessly with our automated reminders
              for students and teachers. Never miss an important exam again!
            </p>{" "}
          </div>{" "}
          <div className="feature">
            <h3> Lecture Scheduling</h3>{" "}
            <p id="special-p">
              {" "}
              Create and manage class timetables with ease. Handle substitute
              teachers and room changes seamlessly, ensuring a smooth learning
              experience.
            </p>{" "}
          </div>{" "}
          <div className="feature">
            <h3> Communication System</h3>{" "}
            <p id="special-p">
              {" "}
              Instantly send important announcements & updates to students and
              parents, ensuring smooth and transparent communication.
            </p>{" "}
          </div>{" "}
          <div className="feature">
            <h3> Fee Management</h3>{" "}
            <p id="special-p">
              {" "}
              Automate fee collection with timely reminders and detailed payment
              tracking, reducing manual work and errors.
            </p>{" "}
          </div>{" "}
          <div className="feature">
            <h3> Progress Reports</h3>{" "}
            <p id="special-p">
              {" "}
              Generate comprehensive performance reports with detailed
              analytics, helping students and teachers track academic progress
              effectively.
            </p>{" "}
          </div>{" "}
          <div className="feature">
            <h3> Top Performers</h3>{" "}
            <p id="special-p">
              {" "}
              Recognize and showcase high-achieving students with an automated
              ranking system and achievement badges.
            </p>{" "}
          </div>{" "}
          <div className="feature">
            <h3> Parent Communication</h3>{" "}
            <p id="special-p">
              {" "}
              Enable direct messaging between teachers and parents for better
              collaboration and student support.
            </p>{" "}
          </div>{" "}
        </div>{" "}
        <div className="comparison-table">
          <h2> Why Choose StudyUnify ? </h2>{" "}
          <table>
            <thead>
              <tr>
                <th> Feature </th> <th> StudyUnify </th> <th> Competitor A </th>{" "}
                <th> Competitor B </th>{" "}
              </tr>{" "}
            </thead>{" "}
            <tbody>
              <tr>
                <td> Test Schedule </td> <td> ✔ </td> <td> ✖ </td> <td> ✖ </td>{" "}
              </tr>{" "}
              <tr>
                <td> Lecture Schedule </td> <td> ✔ </td> <td> ✖ </td>{" "}
                <td> ✖ </td>{" "}
              </tr>{" "}
              <tr>
                <td> Real-Time Student Progress </td> <td> ✔ </td> <td> ✖ </td>{" "}
                <td> ✖ </td>{" "}
              </tr>{" "}
              <tr>
                <td> Parent Dashboard (Performance Tracking) </td> <td> ✔ </td>{" "}
                <td> ✖ </td> <td> ✖ </td>{" "}
              </tr>{" "}
              <tr>
                <td> Online Attendance </td> <td> ✔ </td> <td> ✖ </td>{" "}
                <td> ✖ </td>{" "}
              </tr>{" "}
              <tr>
                <td> Real-Time Notifications </td> <td> ✔ </td> <td> ✖ </td>{" "}
                <td> ✖ </td>{" "}
              </tr>{" "}
            </tbody>{" "}
          </table>{" "}
        </div>{" "}
      </Section>
      {/* How It Works Section */}{" "}
      <Section id="how-it-works" className="how-it-works">
        <h1> How It Works </h1>{" "}
        <div className="steps">
          <div className="step">
            <h3> Step 1 : Sign Up </h3>{" "}
            <p id="special-p"> Create your account and set up your profile effortlessly. </p>{" "}
          </div>{" "}
          <div className="step">
            <h3> Step 2: Organize </h3>{" "}
            <p id="special-p">
              {" "}
              Add your notes, schedules, and important resources in one place.{" "}
            </p>{" "}
          </div>{" "}
          <div className="step">
            <h3> Step 3: Collaborate </h3>{" "}
            <p id="special-p">
              {" "}
              Connect with peers, teachers, and study groups to enhance
              learning.{" "}
            </p>{" "}
          </div>{" "}
          <div className="step">
            <h3> Step 4: Track Progress</h3>{" "}
            <p id="special-p">
              {" "}
              Monitor your attendance, test scores, and study performance in
              real time.{" "}
            </p>{" "}
          </div>{" "}
          <div className="step">
            <h3> Step 5: Stay Notified </h3>{" "}
            <p id="special-p">
              {" "}
              Get instant alerts for lectures, exams, and important updates.
            </p>{" "}
          </div>{" "}
          <div className="step">
            <h3> Step 6: Achieve Success </h3>{" "}
            <p id="special-p">
              {" "}
              Stay on top of your studies, improve efficiency, and reach your
              academic goals.{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </Section>
      {/* Testimonials Section */}{" "}
      <Section id="testimonials" className="testimonials">
        <h1> Testimonials & Reviews </h1>{" "}
        <div className="review-list">
          <div className="review">
            <p className="p2"> "StudyUnify has transformed how I manage my studies!" </p>{" "}
            <h4> -Jane Doe </h4>{" "}
          </div>{" "}
          <div className="review">
            <p className="p2"> "The AI reminders are a game-changer." </p>{" "}
            <h4> -John Smith </h4>{" "}
          </div>{" "}
        </div>{" "}
      </Section>
      {/* Pricing Section */}{" "}
      <Section id="pricing" className="pricing">
        <h1> Pricing & Subscription Plans </h1>{" "}
        <div className="plans">
          <div className="plan">
            <h3 > Free Plan </h3> <p > Basic features for casual users. </p>{" "}
            <p > $0 / month </p> <button className="cta"> Get Started </button>{" "}
          </div>{" "}
          <div className="plan">
            <h3> Premium Plan </h3>{" "}
            <p> Unlock all features for serious learners. </p>{" "}
            <p> $9 .99 / month </p>{" "}
            <button className="cta"> Subscribe Now </button>{" "}
          </div>{" "}
        </div>{" "}
      </Section>
      {/* FAQ Section */}{" "}
      <Section id="faq" className="faq">
        <h1> Frequently Asked Questions </h1>{" "}
        <div className="faq-list">
          <div className="faq-item">
            <h3> Is StudyUnify free to use ? </h3>{" "}
            <p id="special-p">
              {" "}
              Yes, we offer a free plan with basic features.You can upgrade to
              premium for more advanced tools.{" "}
            </p>{" "}
          </div>{" "}
          <div className="faq-item">
            <h3> Can I collaborate with others ? </h3>{" "}
            <p id="special-p">
              {" "}
              Absolutely!StudyUnify allows you to connect with peers for group
              study and projects.{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </Section>
      {/* Contact Section */}
      {" "}
      <Section id="contact" action="#" className="contact">
        <h1> Contact & Support </h1>{" "}
        <form
          className="contact-form"
          action="/"
          method=""
          onSubmit={handleSubmit}
        >
          {" "}
          <motion.input
            type="text"
            placeholder="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            whileFocus={{ borderColor: "#d3d3d3" }}
          />{" "}
          {errors.name && <p className="error">{errors.name}</p>}{" "}
          <motion.input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            whileFocus={{ borderColor: "#d3d3d3" }}
          />{" "}
          {errors.email && <p className="error">{errors.email}</p>}{" "}
          <motion.textarea
            placeholder="Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            whileFocus={{ borderColor: "#d3d3d3" }}
          />{" "}
          {errors.message && <p className="error">{errors.message}</p>}{" "}
          <motion.button
            type="submit"
            className="cta"
            whileHover={{ scale: 1.05, opacity: 0.9 }}
            whileTap={{ scale: 1 }}
          >
            Send Message{" "}
          </motion.button>{" "}
        </form>{" "}
        <div className="contact-info">
          <p className="p3"> Email : jdkgroupceo@gmail.com</p>{" "}
          <p className="p3"> Phone :+91 6355 604 903</p>{" "}
          <p className="p3">
            Follow us:
            <a href="#"> Twitter </a> |{" "}
            <a href="https://www.instagram.com/jdkgroupofficial/"> Instagram </a>{" "}
            |{" "}
            <a href="https://www.linkedin.com/company/105446146/admin/dashboard/">
              {" "}
              LinkedIn{" "}
            </a>{" "}
          </p>{" "}
        </div>{" "}
      </Section>{" "}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />{" "}
    </div>
  );
};

export default App;
