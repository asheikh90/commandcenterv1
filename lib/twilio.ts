import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const conversationServiceSid = process.env.TWILIO_CONVERSATIONS_SID

export async function getOrCreateConversation(phone: string): Promise<string> {
  try {
    // Try to find existing conversation
    const conversations = await client.conversations.v1.conversations.list({
      limit: 100
    })
    
    const existing = conversations.find(c => 
      c.uniqueName === `lead-${phone.replace(/\D/g, '')}`
    )
    
    if (existing) {
      return existing.sid
    }

    // Create new conversation
    const conversation = await client.conversations.v1.conversations.create({
      uniqueName: `lead-${phone.replace(/\D/g, '')}`,
      friendlyName: `Lead ${phone}`
    })

    // Add participant
    await client.conversations.v1.conversations(conversation.sid)
      .participants.create({
        'messagingBinding.address': phone
      })

    return conversation.sid
  } catch (error) {
    console.error('Error with conversation:', error)
    throw error
  }
}

export async function sendMessage(conversationSid: string, body: string) {
  try {
    const message = await client.conversations.v1.conversations(conversationSid)
      .messages.create({
        body,
        author: process.env.TWILIO_FROM
      })
    
    return message
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export async function listMessages(conversationSid: string) {
  try {
    const messages = await client.conversations.v1.conversations(conversationSid)
      .messages.list({ limit: 50 })
    
    return messages.map(msg => ({
      direction: msg.author === process.env.TWILIO_FROM ? 'outbound' : 'inbound',
      body: msg.body,
      created_at: msg.dateCreated
    }))
  } catch (error) {
    console.error('Error listing messages:', error)
    return []
  }
}
