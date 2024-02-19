import { Link } from "react-scroll";

export default function HeroSection() {
    return (
        <section id="heroSection" className="hero--section">
            <div className="hero--section--content--box">
                <div className="hero--section--content">
                    <p className="section--title">Hey, I'm Albert</p>
                    <h1 className="hero--section--title">
                        <span className="hero--section-title--color">Product Manager, Explorer, and Creative</span>{" "}
                    </h1>
                    <p className="hero--section-description">Based Anywhere.</p>
                </div>
                <Link className="btn btn-primary"
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    to="Contact">Get In Touch</Link>
            </div>
            <div className="hero--section--img">
                <img src="./img/hero_img.png" alt="Hero Section" />
            </div>
        </section>
    );
}