
require('dotenv').config();

const { App } = require('@slack/bolt');

const app = new App({
    signingSecret: "509aa143a9443b8555447987dfe107b6",
    token: "xoxb-268086987505-6284266826912-Diw4rmJOrcUfwhsaLkQJhdRp",
});
console.log('SLACK_SIGNING_SECRET:', process.env.SLACK_SIGNING_SECRET);

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bolt app is running!');
})()

app.command('/ticket_request', async({ack, body, client})=> {
     await ack();

     try{
        const result = await client.views.open({
            trigger_id: body.trigger_id,

            view: {
                type: 'modal',
                callback_id: 'model-identifier',
                title: {
                    type: 'plain_text',
                    text: 'My Modal',
                },
                blocks: [
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
                        "element": {
                            "type": "plain_text_input",
                            "multiline": true,
                            "action_id": "plain_text_input-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Message",
                            "emoji": true
                        }
                    },
                    {
                        "type": "actions",
                        "elements": [
                            {
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Send",
                                    "emoji": true
                                },
                                "value": "send_button",
                                "action_id": "send_button_action"
                            }
                        ]
                    },
                    {
                        
                       
                            
                                "type": "button",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Cancel",
                                    "emoji": true
                                },
                                "value": "cancel_button",
                                "action_id": "cancel_button_action"
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

