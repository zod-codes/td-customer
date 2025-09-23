import { useState, useRef, useEffect } from 'react';
import { Link } from "react-router-dom";

const Login = () => {

    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');
    const timerRef = useRef(null);
    const redirectUrl = "InfoDisplay";

    useEffect(() => {
        return () => {
            // cleanup any pending timeout when component unmounts
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, []);

    const clearErrorLater = (ms = 3000) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setError('');
            timerRef.current = null;
        }, ms);
    };

    const onContinue = (e) => {
        e.preventDefault();

        // If an error is currently visible, do nothing (mimics original guard)
        if (document.getElementById('error')) return;

        let obj = null;
        try {
            const raw = localStorage.getItem('formSubmissionData');
            obj = raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.error('Failed to parse formSubmissionData', err);
            setError('Internal error reading saved account — please try again.');
            clearErrorLater();
            return;
        }

        const savedUserId = obj && typeof obj.UserID !== 'undefined' ? String(obj.UserID) : null;

        if (savedUserId && savedUserId === userId) {
            // success: navigate to target page (same-window)
            // Clear the input to mimic original behaviour
            setUserId('');
            // Use location.assign to mimic clicking a normal link in same window
            if (typeof window !== 'undefined') window.location.assign(redirectUrl);
        } else {
            // failed
            setError("Error logging in, the account inputted does not match what's in our database.");
            console.log('Saved User ID = ' + savedUserId, 'User ID = ' + userId);
            clearErrorLater();
        }
    };

    function handleOnChange(ev) {
        console.log('onChange', ev.target.value);
        setUserId(ev.target.value);
    }


    return (
        <>
            <div className="sr-only">
                <p>This is a pet project to improve my skills. This is not the real site.</p>
            </div>
            
            <div id="top">
                <div id="sublocal">
                    <ul>
                        <li id="help"><a href="https://treasurydirect.gov/indiv/help/TDHelp/default.htm" target="_blank" rel="noopener noreferrer">Help</a></li>
                    </ul>
                </div>

            </div>

            <div id="primaryNav">&nbsp;</div>

            <div id="content">

                <form action="#" method="post" id="Login" name="Login">

                    <h1>Access Your Account &raquo; <strong>User ID</strong></h1>

                    <div className="dividerline">&nbsp;</div>

                    <div id="infomessage">
                        <p>
                            <strong>Important message:</strong><br /><br /> WARNING WARNING WARNING<br />
                            You are accessing a U.S. Government information system (which includes computers, computer networks,
                            and all devices and storage media attached to a Treasury network or to a computer on such network) that
                            is provided for U.S. Government-authorized use only. By using this system, you understand and consent
                            that there is no reasonable expectation of privacy regarding any communications or information
                            transiting, stored on, or traveling to or from this system. The government routinely monitors and may, for any lawful
                            government purpose, intercept, search, and seize any communication or information transiting, stored
                            on, or traveling to or from this information system and such information may be disclosed or used for any
                            lawful government purpose.
                        </p>
                    </div>

                    <p>Please enter your Account Number.</p>
                    <table className="lineup">
                        <tbody>
                            <tr>
                                <td className="alignright" valign="top"><strong>Account User ID:</strong></td>
                                <td rowSpan="2" className="fade">&nbsp;</td>

                                <td valign="top">
                                    <input type="text" name="UserID" size="9" maxLength="9" pattern="[a-zA-Z0-9]+" autoComplete="username" value={userId} onChange={(ev) => handleOnChange(ev)} required />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <br />


                    <button className="action" type="button" name="Continue" value="" onClick={onContinue}>Continue</button>

                    {error && <p id="error" style={{ color: 'red', marginTop: 8 }}>{error}</p>}

                </form>
            </div>

            <div id="footer">
                <ul>
                    <li>
                        <Link to="ContactUsPage" target="_blank" rel="noopener noreferrer">Contact Us</Link>
                    </li>
                </ul>
            </div>
        </>
    );
}

export default Login;