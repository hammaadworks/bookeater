import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({ apiKey: 'AIzaSyCm5bKf1BETdhD3Vgez8ldp_y52EJhMdz4' });

async function test() {
  try {
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      schema: z.object({ idea: z.string() }),
      messages: [{ role: 'user', content: 'Say hello' }]
    });
    console.log('Success:', object);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
