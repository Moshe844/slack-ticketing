
require('dotenv').config();
const nodemailer = require("nodemailer");

const { App, ExpressReceiver } = require('@slack/bolt');

const database = {};

const expressReceiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
})
const app = new App({
    receiver: expressReceiver,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: process.env.SLACK_STATE_SECRET,
    scopes: ['app_mentions:read', 'chat:write', 'commands'],
    installationStore: {
        storeInstallation: async (installation) => {
            try {
                if (installation.isEnterpriseInstall) {
                    database[installation.enterprise.id] = installation;
                } else {
                    database[installation.team.id] = installation;
                }
            } catch (error) {
                console.error('Error storing installation:', error);
                throw error;
            }
        },
        fetchInstallation: async (installQuery) => {
            try {
                if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
                    return database[installQuery.enterpriseId];
                }
                if (installQuery.teamId !== undefined) {
                    return database[installQuery.teamId];
                }
                throw new Error('Failed fetching installation');
            } catch (error) {
                console.error('Error fetching installation:', error);
                throw error;
            }
        },
    },
});


(async () => {
    try {
      await app.start(process.env.PORT || 3000);
      console.log('⚡️ Bolt app is running!');
    
     
 
    } catch (error) {
      console.error('Error starting Bolt app:', error);
    }
})();

 



app.command('/ticket_request', async({ack, body, client})=> {
    try{
     await ack();
      
     console.log(body.trigger_id);
     
        const result = await client.views.open({
            trigger_id: body.trigger_id,

            view: {
                "title": {
                    "type": "plain_text",
                    "text": "Submit request"
                },
                "submit": {
                    "type": "plain_text",
                    "text": "Submit"
                },
                
                "blocks": [
                    {
                        "type": "input",
                        "element": {
                            "type": "radio_buttons",
                            "options": [
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": "*Technical support*",
                                        "emoji": true
                                    },
                                    "value": "value-0"
                                },
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": "*Gateway support*",
                                        "emoji": true
                                    },
                                    "value": "value-1"
                                },
                            ],
                            "action_id": "radio_buttons-action"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Choose team to request assistance.",
                            "emoji": true
                        }
                    },
                    {
                        "type": "input",
                        "element": {
                            "type": "plain_text_input",
                            "action_id": "sl_input",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Subject...."
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
                                "text": "Message...."
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

app.view('your_view_callback_id', async ({ ack, body, client }) => {
    console.log('View Submission Payload:', JSON.stringify(body, null));
    // const subject = body.view.state.values.uik1r.sl_input.value;
    // const message = body.view.state.values["35GrF"].ml_input.value;

try{
    const radioButtons = body.view.state.values['ApkXa'];

    // Log the radioButtons to see its structure
    console.log('Radio Buttons:', radioButtons);

    // Check if "radio_buttons-action" is present in radioButtons
    const selectedOption = radioButtons && radioButtons['radio_buttons-action']
        ? radioButtons['radio_buttons-action'].selected_option.value
        : null;

    console.log('Selected Option:', selectedOption);

    // Determine the email address based on the selected checkbox
    const emailAddress = selectedOption === 'value-0'
        ? 'techsupport@fidelitypayment.com'
        : selectedOption === 'value-1'
            ? 'GatewaySupport@cardknox.com'
            : null;

            // const userInfo = await client.users.info({
            //     user: body.user.id
            // })
            // const username = userInfo.user.name
            // const userId = body.user.id;

           

        const subject = body.view.state.values['U63NL'].sl_input.value;
        const message = body.view.state.values['Vcq9K'].ml_input.value;
    
    console.log("Decoded Message", message);
    
    await sendEmail( subject, message, emailAddress) 
    await ack();

    const channelID = body.channel && body.channel.id ? body.channel.id : body.user.id;
    const successMessage = await client.chat.postEphemeral({
        text: 'Your request has been submitted successfully!',
        user: body.user.id,
        channel: channelID
    })
    console.log('Success Message:', successMessage);
    console.log('Acknowledged view submission', body);
 } catch (error){
        console.error(error)
    }

    // Check if "checkboxes-action" is present in the payload
});



async function sendEmail(subject, message, emailAddress){

    console.log('Subject:', subject);
    console.log('My Message:', message);

    // const base64encodedMessage = Buffer.from(message,  'base64').toString('utf-8')

   const transporter =  nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        }
    })

    const info = await transporter.sendMail({
          from: "SlackEmail <devagent@cardknox.com>",
          to: emailAddress,
          subject:subject,
          text: message
    })
    console.log("message sent:" + info.messageId);
    console.log("Message info:", info);
    console.log("message rejected:" + info.rejected)
}


// sendEmail().catch(console.error)

