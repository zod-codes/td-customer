// src/pages/Confirmation.jsx
import { useEffect, useRef, useState } from "react";
import { restoreScheduledDeletions, scheduleDeletionAfterDays, cancelScheduledDeletion } from "../utils/IsAutoDelete";
import "../styles/confirmation.css";

const Confirmation = () => {
    const primaryNav = useRef(null);
    const proceedBtnRef = useRef(null);
    const modalRef = useRef(null);
    const mountedRef = useRef(true);
    const count = useRef(0);

    const [currentStep, setCurrentStep] = useState(1);
    const [activeColor] = useState("#0b6fc0");
    const [showModal, setShowModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    // keep mountedRef correct
    useEffect(() => {
        mountedRef.current = true;
        restoreScheduledDeletions();
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    const handleProceed = async (ev) => {
        ev?.preventDefault?.();

        const btn = proceedBtnRef.current;
        if (!btn) return;

        // reset & UI prep
        console.log('[flow] start proceed');
        if (!mountedRef.current) return;
        setShowConfirmation(false);

        try { btn.disabled = true; } catch (e) { console.error(e); }

        setShowModal(true);
        // focus modal when it mounts
        setTimeout(() => {
            try { modalRef.current?.focus(); } catch (e) { console.error(e); }
        }, 0);

        // wait 2s
        await wait(1500);

        // if unmounted during wait, bail
        if (!mountedRef.current) {
            try { if (btn) btn.disabled = false; } catch (e) { console.error(e); }
            console.log('[flow] aborted — unmounted');
            return;
        }

        // hide modal first
        console.log('[flow] hiding modal');
        setShowModal(false);

        // wait a frame so CSS/DOM can update (ensures modal is visually gone)
        await new Promise(requestAnimationFrame);

        // small extra tick for CSS transitions (optional)
        await new Promise(r => setTimeout(r, 20));

        // show confirmation
        setShowConfirmation(true);
        console.log('[flow] showConfirmation set: ', showConfirmation);

        // advance step
        // setCurrentStep(prev => Math.min(prev + 1, 4)); 
        setCurrentStep(1);
        count.current += 1;
        if (count.current >= 1) {
            try {
                if (btn) btn.disabled = true;
                btn.textContent = "Proceeding..."
                btn.focus();
                return;
            } catch (error) { console.error(error) };
        };

        if (scheduleDeletionAfterDays("formSubmissionData", 30)) {
            cancelScheduledDeletion("formSubmissionData");
        };

        try { if (btn) btn.disabled = false; } catch (e) { console.error(e); }
        try { btn.focus(); } catch (e) { console.error(e); }
    };

    const labels = [
        "Pending Payment",
        "In Progress",
        "Approved for Delivery",
        "Case Closed",
    ];

    return (
        <>
            <div className="sr-only">
                <p>This is a pet project to improve my skills. This is not the real site.</p>
            </div>
            
            <div id="top">
                <div id="sublocal">
                    <ul>
                        <li id="help">
                            <a
                                href="http://www.treasurydirect.gov/indiv/help/TDHelp/default.htm"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Help
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div id="primaryNav" ref={primaryNav}>&nbsp;</div>

            <div id="content">
                <h1>
                    <strong>ASSET STATUS</strong>
                </h1>

                <div
                    id="statusBar"
                    className="status-bar"
                    // reflect state here — no manual DOM writes
                    data-step={currentStep}
                    aria-label="Progress"
                >
                    <ol className="steps" role="list">
                        {labels.map((label, idx) => {
                            const isActive = currentStep === idx + 1;
                            return (
                                <li
                                    key={label}
                                    className={`step ${isActive ? "current" : ""}`}
                                    data-label={label}
                                    role="listitem"
                                >
                                    <div
                                        className="pill"
                                        style={{
                                            background: isActive ? activeColor : undefined,
                                            color: isActive ? "#fff" : undefined,
                                        }}
                                        aria-current={isActive ? "step" : undefined}
                                    >
                                        <span className="text">{label}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <p>
                    We have received a payment of $8,220 from the outstanding total of
                    $28,220 required to cover Customs duties and treasury discharge bond
                    documentation for the release of your assets.
                </p>
                <br />
                <br />
                <h1>
                    <strong>Important Notice !!!</strong>
                </h1>
                <p>
                    The status of your SafeBox and Briefcase can be checked here at any
                    time. Please note that your case cannot be finalized until the
                    remaining $20,000 payment is completed. This payment is necessary to
                    proceed with the release process. If you are ready to complete the
                    outstanding balance and move forward with the release of your assets,
                    please click the Proceed button below to confirm and finalize the
                    required documentation.
                </p>

                <button id="proceed" ref={proceedBtnRef} onClick={handleProceed}>
                    Proceed
                </button>
                <br />
                <br />

                {/* Modal: only mounted while showModal true */}
                {showModal && (
                    <div className="verification-modal" role="dialog" aria-modal="true" aria-hidden={!showModal ? "true" : "false"} ref={modalRef} tabIndex={-1}>
                        <div className="modal-box" role="document">
                            <h2 style={{ margin: "0 0 .2rem" }}>Verifying…</h2>
                            <p style={{ margin: 0, fontSize: "0.95rem", color: "#333" }}>
                                Please wait while we verify your intent to proceed.
                            </p>
                        </div>
                    </div>
                )}

                {/* Confirmation: only mounted when showConfirmation true */}
                {showConfirmation && (
                    <section id="confirmation" tabIndex={-1} style={{ display: 'block' }}>
                        <h1>
                            <strong>Confirmation</strong>
                        </h1>
                        <p>
                            Thank you for clicking the Proceed button. You have successfully
                            confirmed your intent to complete the pending process. Kindly
                            submit the outstanding balance to the appropriate department and
                            return here to check for updates on your case status.
                        </p>
                    </section>
                )}
            </div>

            <footer id="footer">
                <ul>
                    <li>
                        <a
                            href="http://www.treasurydirect.gov/foia.htm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Freedom of Information Act
                        </a>
                    </li>
                    <li>|</li>
                    <li>
                        <a
                            href="http://www.treasurydirect.gov/law_and_guidance.htm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Law &amp; Guidance
                        </a>
                    </li>
                    <li>|</li>
                    <li>
                        <a
                            href="http://www.treasurydirect.gov/privacy.htm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy &amp; Legal Notices
                        </a>
                    </li>
                    <li>|</li>
                    <li>
                        <a
                            href="http://www.treasurydirect.gov/terms.htm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Website Terms &amp; Conditions
                        </a>
                    </li>
                    <li>|</li>
                    <li>
                        <a
                            href="http://www.treasurydirect.gov/accessibility.htm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Accessibility
                        </a>
                    </li>
                    <li>|</li>
                    <li>
                        <a
                            href="http://www.treasurydirect.gov/data_quality.htm"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Data Quality
                        </a>
                    </li>
                </ul>
                <p>
                    <a
                        href="http://www.fiscal.treasury.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        U.S. Department of the Treasury, Bureau of the Fiscal Service
                    </a>
                </p>
            </footer>
        </>
    );
};

export default Confirmation;
