
require('dotenv').config();
const nodemailer = require("nodemailer")
const { App } = require('@slack/bolt');
const { info } = require('console');

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
                            "text": "Label"
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
                            "text": "Label"
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
app.view('your_view_callback_id', async ({ ack, body, client }) => {
    try {
        // Process the view submission here
        await sendEmail(client, body.view.state.values);
        await ack();
        console.log('Acknowledged view submission', body);
    } catch (error) {
        console.error('Error processing view submission:', error);
        await ack({ response_action: 'errors', errors: { error: 'Something went wrong.' } });
    }
});

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
       user: process.env.GMAIL_USER,
       pass: process.env.GMAIL_PASSWORD
    }
})

async function sendEmail(){
    const info = await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: "arye6700@gmail.com",
        subject: "Hello",
        text: "testing purposes"
    });

    console.log("Message sent %s", info.messageId);
}

sendEmail().catch(console.error)