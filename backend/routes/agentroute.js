const router = require('express').Router();
const Groq = require('groq-sdk');
const ScheduledPost = require('../models/scheduledpostmodel');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/chat', async (req, res) => {
  try {
    const { userId, messages, localTime } = req.body;
    
    if (!messages || messages.length === 0) return res.status(400).json({ error: "Messages are required" });

    const systemPrompt = `You are a helpful AI assistant for a social media app called Orbit. 
You can answer general questions and chat with the user.
You can also schedule posts for the user. 
The user's current local date and time is: ${localTime || new Date().toISOString()}.
When calculating future dates (like "tomorrow" or "at 12am"), calculate them relative to THIS local time, not UTC.
If the user asks to schedule a post (e.g. "/schedule post 'hello' at 12am" or explicitly asks to schedule), extract the content of the post and calculate the exact date/time they want to post it in the future.
If they want to schedule a post, reply ONLY with a raw JSON object (do not wrap in markdown code blocks) in this exact format:
{"action": "schedule_post", "content": "the post content", "scheduledFor": "ISO 8601 date string"}
If they are just chatting or asking a question, reply normally with conversational text. Do NOT use JSON format unless scheduling a post.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
    });

    const reply = chatCompletion.choices[0]?.message?.content?.trim() || "";
    
    // Clean up potential markdown formatting that blocks JSON parsing
    const cleanReply = reply.replace(/```json/g, '').replace(/```/g, '').trim();

    // Check if it's a JSON string for scheduling
    if (cleanReply.startsWith('{') && cleanReply.includes('"schedule_post"')) {
      try {
        const jsonReply = JSON.parse(cleanReply);
        if (jsonReply.action === 'schedule_post' && jsonReply.content && jsonReply.scheduledFor) {
          
          const newScheduledPost = new ScheduledPost({
            userId,
            content: jsonReply.content,
            scheduledFor: new Date(jsonReply.scheduledFor)
          });
          
          await newScheduledPost.save();
          
          return res.status(200).json({ 
            reply: `Got it! I have scheduled your post: "${jsonReply.content}" for ${new Date(jsonReply.scheduledFor).toLocaleString()}.` 
          });
        }
      } catch (e) {
        console.error("Failed to parse JSON from Groq:", e);
        // Fall back to returning the raw text if parsing failed
      }
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent encountered an error." });
  }
});

router.post('/schedule', async (req, res) => {
  try {
    const { userId, content, scheduledFor } = req.body;
    
    if (!userId || !content || !scheduledFor) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newScheduledPost = new ScheduledPost({
      userId,
      content,
      scheduledFor: new Date(scheduledFor)
    });
    
    await newScheduledPost.save();
    
    return res.status(200).json({ 
      reply: `Got it! I have explicitly scheduled your post: "${content}" for ${new Date(scheduledFor).toLocaleString()}.` 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent encountered an error scheduling the post." });
  }
});

module.exports = router;
