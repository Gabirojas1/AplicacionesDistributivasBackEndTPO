var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const constants = require("../common/constants");

const oAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_API_KEY,
    process.env.GMAIL_API_SECRET,
    process.env.GMAIL_API_REDIRECT_URI
);

oAuth2Client.setCredentials({
    refresh_token: process.env.GMAIL_API_REFRESH_TOKEN,
});

// Sends email using google API
const sendMail = async (mailOptions) => {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            ...constants.auth,
            accessToken: accessToken,
        },
    });
    return await transport.sendMail(mailOptions);
}

module.exports = {
    sendMail
};
