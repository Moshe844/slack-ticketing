
require('dotenv').config();
const nodemailer = require("nodemailer")
const { App } = require('@slack/bolt');


const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
});
// console.log('SLACK_SIGNING_SECRET:', process.env.SLACK_SIGNING_SECRET);

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');
})()

app.command('/ticket_request', async({ack, body, client})=> {
    try{
     await ack();
     console.log(body.trigger_id);
     
        const result = await client.views.open({
            trigger_id: body.trigger_id,

            view: {
                "title": {
                    "type": "plain_text",
                    "text": "Modal Title"
                },
                "submit": {
                    "type": "plain_text",
                    "text": "Submit"
                },
                
                "blocks": [
                    {
                        "type": "input",
                        "element": {
                            "type": "plain_text_input",
                            "action_id": "sl_input",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Placeholder text for single-line input"
                            }
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Subject"
                        }
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "plain_text_input",
                            "action_id": "ml_input",
                            "multiline": true,
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Placeholder text for multi-line input"
                            }
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Message"
                        }
                    }
                ],
                "callback_id" : "your_view_callback_id",
                "type": "modal"
            }
            
        })

        console.log('Modal opened successfully:', result);

      
     }
     catch (error){
        console.error(error)
     }
})

app.view('your_view_callback_id', async ({ ack, body }) => {
    console.log('View Submission Payload:', JSON.stringify(body, null));
    const subject = body.view.state.values.uik1r.sl_input.value;
    const base64encodedMessage = body.view.state.values["35GrF"].ml_input.value;

    // Decoding the base64 message
    const decodedMessage = Buffer.from(base64encodedMessage, 'base64').toString('utf-8');
    console.log("Decoded Message", decodedMessage);
    
    await sendEmail(subject, decodedMessage);
    await ack();
    console.log('Acknowledged view submission', body);
});

async function sendEmail(subject, message) {
    console.log('Subject:', subject);
    console.log('My Message:', message);

    // Encoding the message to base64 before sending
    const base64Message = Buffer.from(message, 'utf-8').toString('base64');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        }
    });

    const info = await transporter.sendMail({
        from: "SlackEmail <motty6700@gmail.com>",
        to: "techsupport@fidelitypayment.com",
        subject: subject,
        text: base64Message // Sending the base64 encoded message
    });

    console.log("message sent:" + info.messageId);
    console.log("Message info:", info);
    console.log("message rejected:" + info.rejected);
}

// sendEmail().catch(console.error)