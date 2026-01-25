// worker.js
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { campaignTable, recipientTable, statsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { db } from '../lib/db';
import type{ Recipient } from '../types/reciepients';
import type{ Campaign } from '../types/campaign';
const sqsClient = new SQSClient({ region: process.env.AWS_REGION });
const sesClient = new SESClient({ region: process.env.AWS_REGION });

const QUEUE_URL = process.env.SQS_QUEUE_URL;
const CONFIGURATION_SET = 'campaign-tracking';

const SENDING_RATE = 14; // emails per second (adjust based on your quota)
let lastSendTime = Date.now();

async function sendEmail(campaign: Campaign, recipient: Recipient) {
  const timeSinceLastSend = Date.now() - lastSendTime;
  const minInterval = 1000 / SENDING_RATE;
  if (timeSinceLastSend < minInterval) {
    await new Promise(resolve => setTimeout(resolve, minInterval - timeSinceLastSend));
  }
  
  // Replace template variables
  let htmlBody = campaign.emailContent;
  
  htmlBody = htmlBody
    .replace(/{{firstName}}/g, recipient.name?.split(' ')[0] || '')
    .replace(/{{email}}/g, recipient.email);
  

  const command = new SendEmailCommand({
    Source: `${campaign.fromName} <${campaign.fromEmail}>`,
    Destination: {
      ToAddresses: [recipient.email]
    },
    Message: {
      Subject: {
        Data: campaign.subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8'
        }
      }
    },
    ConfigurationSetName: CONFIGURATION_SET // Enable tracking [web:36]
  });
  
  const response = await sesClient.send(command);
  lastSendTime = Date.now();
  
  return response.MessageId;
}

async function processMessage(message: any) {
  const data = JSON.parse(message.Body);
  const { campaignId, recipientId, email } = data;
  
  try {
    // Get campaign and recipient
    const campaignResult = await db.select().from(campaignTable).where(eq(campaignTable.id, campaignId)).limit(1);
    const recipientResult = await db.select().from(recipientTable).where(eq(recipientTable.id, recipientId)).limit(1);
    
    if (!campaignResult[0] || !recipientResult[0]) {
      console.log('Campaign or recipient not found');
      return;
    }
    
    const campaign = campaignResult[0] as Campaign;
    const recipient = recipientResult[0] as Recipient;
    
    // Send email
    const messageId = await sendEmail(campaign, recipient);
    
    // Update recipient status
    await db.update(recipientTable).set({
      status: 'sent',
      messageId: messageId,
      sentAt: new Date().toISOString()
    }).where(eq(recipientTable.id, recipientId));
    
    // Update campaign stats from stats table
    const stats = await db.select().from(statsTable).where(eq(statsTable.campaignId, campaignId)).limit(1);
    if (stats && stats[0]) {
      await db.update(statsTable).set({
        sentCount: Number(stats[0].sentCount) + 1
      }).where(eq(statsTable.campaignId, campaignId));
    }

    console.log(`Email sent to ${email}, MessageId: ${messageId}`);
    
  } catch (error) {
    console.error(`Failed to send to ${email}:`, error);
    
    // Update recipient with error
    await db.update(recipientTable).set({
      status: 'failed',
    }).where(eq(recipientTable.id, recipientId));
    
    // Update campaign stats from stats table
    const stats = await db.select().from(statsTable).where(eq(statsTable.campaignId, campaignId)).limit(1);
    if (stats && stats[0]) {
      await db.update(statsTable).set({
        failedCount: Number(stats[0].failedCount) + 1
      }).where(eq(statsTable.campaignId, campaignId));
    }
  }
}

async function pollQueue() {
  console.log('Worker polling queue...');
  
  while (true) {
    try {
      // Receive messages with long polling [web:31]
      const command = new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: Math.min(10, SENDING_RATE), // Respect rate limit
        WaitTimeSeconds: 20, // Long polling
        VisibilityTimeout: 300 // 5 minutes to process
      });
      
      const response = await sqsClient.send(command);
      
      if (!response.Messages || response.Messages.length === 0) {
        console.log('No messages in queue');
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      console.log(`Processing ${response.Messages.length} messages`);
      
      // Process messages sequentially to respect rate limits [web:31]
      for (const message of response.Messages) {
        await processMessage(message);
        
        // Delete message from queue
        await sqsClient.send(new DeleteMessageCommand({
          QueueUrl: QUEUE_URL,
          ReceiptHandle: message.ReceiptHandle
        }));
      }
      
    } catch (error) {
      console.error('Error polling queue:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

pollQueue().catch(error => {
  console.error('Worker encountered a fatal error:', error);
});