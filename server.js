
require('dotenv').config();

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
     await ack();
     console.log(body.trigger_id);
     try{
        const result = await client.views.open({
            trigger_id: body.trigger_id,

            view: {
                "type": "modal",
                "submit": {
                    "type": "plain_text",
                    "text": "Submit",
                    "emoji": true
                },
                "close": {
                    "type": "plain_text",
                    "text": "Cancel",
                    "emoji": true
                },
                "title": {
                    "type": "plain_text",
                    "text": "Submit ticket",
                    "emoji": true
                },
                "blocks": [
                    {
                        "type": "input",
                        "element": {
                            "type": "plain_text_input",
                            "action_id": "plain_text_input-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Subject",
                            "emoji": true
                        }
                    },
                    {
                        "type": "input",
                        "label": {
                            "type": "plain_text",
                            "text": "How can we help you?",
                            "emoji": true
                        },
                        "element": {
                            "type": "plain_text_input",
                            "multiline": true
                        }
                    }
                ]
            }
        })

        console.log('Modal opened successfully:', result);
     }
     catch (error){
        console.error(error)
     }
})

app.view('modal-identifier', async ({ ack, body, view, client }) => {
    try {
        // Acknowledge the view submission immediately
        ack();

        console.log('View submission', body, view);

        // Respond with "Hello, it's working"
        const response = {
            response_action: "update",
            view: {
                type: "modal",
                title: {
                    type: "plain_text",
                    text: "Submit ticket",
                    emoji: true
                },
                close: {
                    type: "plain_text",
                    text: "Cancel",
                    emoji: true
                },
                blocks: [
                    {
                        type: "section",
                        block_id: "section678",
                        text: {
                            type: "mrkdwn",
                            text: "Hello, it's working"
                        }
                    }
                ]
            }
        };

        // Send the response to update the modal
        await client.views.update({
            view_id: body.view.id,
            hash: body.view.hash,
            view: response.view
        });
    } catch (error) {
        console.error('Error updating view:', error);
    }
});
