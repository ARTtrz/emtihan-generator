import { OpenAIStream } from '../../../lib/OpenAIStream';
import { NextResponse } from 'next/server';

if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing Environment Variable OPENAI_API_KEY');
}

export const runtime = 'edge';

export async function POST(req) {

    const { task } = await req.json();
    console.log(task, 'Task')
    const messages = task.tasks.map((t) => {
        return {
            role: 'system',
            content: `I have a task: ${t}. Write step-by-step descriptors for the task for this task. Example descriptors "Performs the construction of the graph of a function;
            Records the transformations used to construct the graph;". And so do this for the task I provided. 
            Also for each step, write how many points to give. How many points you can decide yourself on the difficulty of the step. Provide points in Russian. 
            Don't write anything else but these steps. Don't write that you are an artificial intelligence, if you don't know what to do better print the word "Error". 
            Generate descriptors in Russian! Make descriptors as short as possible. Make it short and clear.`,
        };
    });

    const payload = {
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
        max_tokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : 200,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true
    };

    try {
        const stream = await OpenAIStream(payload);
        console.log(stream, 'Stream')
        return new NextResponse(stream);
    } catch (error) {
        console.log("Descriptors failed")
        return new NextResponse(JSON.stringify({ error: 'Error fetching data from ChatGPT API for descriptors' }))
    }
}
