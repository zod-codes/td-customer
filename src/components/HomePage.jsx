import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import HYK from "../assets/HYK.svg";
import Btt from "../assets/backToTop.svg";
import USFlag from "../images/icons/us_flag_small.png"
import logo from "../images/logo.svg"

const backToTopStyle = {
    display: 'none',
    position: 'fixed',
    bottom: '1em',
    right: '1em',
    opacity: '50%',
    zIndex: 99999999
}
const HomePage = () => {

    const storedData = useRef(!!localStorage.getItem('formSubmissionData') || false);
    const heading = useRef(null);
    const paragraph = useRef(null);
    const nextPath = storedData.current ? "/Login" : "/CreateYourAccount";


    useEffect(() => {           
        if (storedData.current) {
            heading.current.innerHTML = '<h1>Log In</h1>';
            paragraph.current.innerHTML = '<p>If your account ID starts with a letter, click the <strong><em>next</em></strong> button below: </p>'
        }
    }, []);

    return (
        <>
            <div className="sr-only">
                <p>This is a pet project to improve my skills. This is not the real site.</p>
            </div>
            
            <div className="container">
                <Link className="sr-only sr-only-focusable" to="#main">Skip Navigation</Link>
            </div>

            <div className="text-white bg-usa-blue-dark" role="banner">

                <div className="container-xxl">
                    <div className="row">

                        <div className="col-md py-1 media small">
                            <img className="align-self-center mr-2" src={USFlag} alt="U.S. flag" />
                            <div className="media-body">
                                <span className="mr-2">An official website of the United States government</span>
                                <Link className="d-block d-md-inline-block text-td-blue-light arrow-collapse" role="button" to="#" data-toggle="collapse" data-target="#official-site-collapse" aria-expanded="false" aria-controls="official-site-collapse">
                                    Here’s how you know
                                    <img src={HYK} alt="khahsdas" />
                                </Link>
                            </div>
                        </div>

                        <div className="col-md py-1 border-top border-md-0 border-usa-gray-light small text-md-right">
                            <Link className="text-white" to="#" target="_blank" rel="nofollow noopener noreferrer">U.S. Department of the Treasury
                            </Link>
                        </div>

                    </div>
                </div>

                <div id="official-site-collapse" className="collapse container-xxl border-top border-md-0 border-usa-gray-light">
                    <div className="row">

                        <div className="p-3 col-md-6">
                            <div className="media">
                                <img className="w-2-5em h-2-5em mr-2" src="https://treasurydirect.gov/images/icons/icon-dot-gov.svg" alt="" />
                                <div className="media-body">
                                    <strong>Official websites use .gov</strong><br />
                                    A <strong>.gov</strong> website belongs to an official government organization in the United States.
                                </div>
                            </div>
                        </div>

                        <div className="p-3 col-md-6">
                            <div className="media">
                                <img className="w-2-5em h-2-5em mr-2" src="https://treasurydirect.gov/images/icons/icon-https.svg" alt="" />
                                <div className="media-body">
                                    <strong>Secure .gov websites use HTTPS</strong><br />
                                    A <strong>lock</strong> (<span className="icon-lock-white"></span>) or <strong>https://</strong> means you’ve
                                    safely connected to the .gov website. Share sensitive information only on official, secure websites.
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>


            <header id="header-site" className="bg-white">

                <div className="container-xxl">
                    <nav className="navbar navbar-expand-lg navbar-td p-0">
                        <Link className="navbar-brand d-lg-none py-3" to="">
                            <img src={logo} alt="jahsjahs" />
                        </Link>

                        <button className="navbar-toggler btn btn-outline-td-blue nav-text-small shadow-none" data-toggle="collapse"
                            data-target="#site-nav-collapse" aria-controls="site-nav-collapse" aria-expanded="false"
                            aria-label="Toggle navigation">
                            <span className="align-middle">Menu</span></button>

                        <div className="collapse navbar-collapse flex-wrap navbars" id="site-nav-collapse">

                            <Link className="navbar-brand d-none d-lg-block py-lg-4 order-lg-0" to="/">
                                <img src={logo} alt="" />
                            </Link>

                        </div>
                    </nav>
                </div>

            </header>



            <main id="main">

                <section>
                    <div className="section-container container-xxl">

                        <div className="grid-row-container row ">

                            <div className="grid-column-container col-md">
                                <div className="negate">
                                    <div className="consume">

                                        <div className="body-copy">
                                            <h1 ref={heading}>Create your account</h1>
                                        </div>

                                        <p ref={paragraph}>To create your account, click the <strong><em>next</em></strong> button below:
                                        </p>

                                        <div className="buttons-block">
                                            <div className="wrapper">
                                                <Link className="btn btn-td-blue" to={nextPath} target="_blank">Next</Link>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </section>

                <button type="button" className="btn btn-td-blue scrollButton d-print-none" id="myBtn" title="Back to Top" style={backToTopStyle}>
                    <img src={Btt} alt="" />
                </button>

            </main>


            <footer>

                <nav>
                    <div className="container-xxl hide-print">
                        <div className="wrapper py-5">

                            <div className="row">

                                <div className="col-12 col-md-4">
                                    <h3>Connect With Us</h3>
                                    <ul className="list-unstyled nav-text-large social-icons">
                                        <li><Link className="no-icon" target="_blank" rel="noopener noreferrer nofollow"
                                            to="https://twitter.com/treasurydirect/"><span className="icon-twitter mr-2"></span>X (formerly
                                            Twitter)</Link></li>
                                        <li><Link className="no-icon" target="_blank" rel="noopener noreferrer nofollow"
                                            to=".com/fiscalservice/"><span className="icon-facebook mr-2"></span>Facebook</Link>
                                        </li>
                                        <li><Link className="no-icon" target="_blank" rel="noopener noreferrer nofollow" to="com/TreasuryDirect/"><span className="icon-youtube mr-2"></span>YouTube</Link>
                                        </li>
                                        <li><Link className="no-icon" to="https://treasurydirect.gov/rss/"><span className="icon-rss mr-2"></span>RSS
                                            Feeds</Link></li>
                                    </ul>
                                </div>

                                <div className="col-12 col-md-4">
                                    <h3>Legal Information</h3>
                                    <ul className="list-unstyled nav-text-small">
                                        <li><Link to="https://treasurydirect.gov/legal-information/developers/">For Web Developers</Link></li>
                                        <li><Link to="https://treasurydirect.gov/legal-information/accessibility/">Accessibility</Link></li>
                                    </ul>
                                </div>

                            </div>

                        </div>
                    </div>
                </nav>

            </footer>
        </>
    );
}

export default HomePage;