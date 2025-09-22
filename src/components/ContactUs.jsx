const ContactUs = () => {
    return (
        <>
            <div className="sr-only">
                <p>This is a pet project to improve my skills. This is not the real site.</p>
            </div>
            
            <div id="top">
                <div id="sublocal">&nbsp;
                </div>
                <div id="utility">&nbsp;
                </div>
            </div>

            <div id="primaryNav">
                &nbsp;
            </div>

            <div id="content">

                <form action="https://api.web3forms.com/submit" method="POST">

                    <input type="hidden" name="access_key" value="8846fd41-02bb-4bc3-9676-9cfc9e69bbd7" />

                    <h1><strong>Contact Us</strong></h1>

                    <p><span class="emphasis">Have a question about TreasuryDirect? E-mail us and we'll be happy to assist
                        you.</span></p>

                    <table>
                        <tr>
                            <td class="alignright"><strong>Name:</strong></td>
                            <td><input type="text" value="" name="name" size="65" maxlength="60" /></td>
                        </tr>
                        <tr>
                            <td class="alignright"><strong>Account Number:</strong></td>
                            <td>N/A</td>
                        </tr>
                        <tr>
                            <td class="alignright"><strong>E-mail Address:</strong></td>
                            <td><input type="text" value="" name="emailAddress" size="65" maxlength="50" /></td>
                        </tr>
                        <tr>
                            <td class="alignright"><strong>Daytime Phone:</strong></td>
                            <td>(<input type="text" value="" name="daytimePhone1" size="3" maxlength="3" />) <input type="text"
                                value="" name="daytimePhone2" size="3" maxlength="3" /> - <input type="text" value=""
                                    name="daytimePhone3" size="4" maxlength="4" />&nbsp;&nbsp;&nbsp;<strong>Ext: </strong><input
                                    type="text" value="" name="daytimePhone4" size="5" maxlength="5" /></td>
                        </tr>
                        <tr>
                            <td class="alignright"><strong>Message:</strong></td>
                            <td><textarea name="message" cols="56" rows="5"></textarea></td>
                        </tr>
                    </table>

                    <p>
                        <input class="action" type="submit" name="5095931330204611812" value="Send" />
                    </p>
                    <div class="statementmessage">
                        <p>To close this window, click the "X" in the top, right corner.</p>
                    </div>

                </form>

            </div>

            <div id="footer">
                <ul>
                    <li><a href="#" target="_blank" rel="noopener noreferrer">Freedom of
                        Information Act</a></li>
                    <li>|</li>
                    <li><a href="#" target="_blank"
                        rel="noopener noreferrer">Law &amp; Guidance</a></li>
                    <li>|</li>
                    <li><a href="#" target="_blank" rel="noopener noreferrer">Privacy
                        &amp; Legal Notices</a></li>
                    <li>|</li>
                    <li><a href="#" target="_blank" rel="noopener noreferrer">Website
                        Terms &amp; Conditions</a></li>
                    <li>|</li>
                    <li><a href="#" target="_blank"
                        rel="noopener noreferrer">Accessibility</a></li>
                    <li>|</li>
                    <li><a href="#" target="_blank" rel="noopener noreferrer">Data
                        Quality</a></li>
                </ul>
                <p>
                    <a href="https://www.fiscal.treasury.gov/" target="_blank" rel="noopener noreferrer">U.S. Department of the
                        Treasury, Bureau of the Fiscal Service</a>
                </p>
            </div>
        </>
    );
};

export default ContactUs;