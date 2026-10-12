I want to build an HTML, CSS, JS landing page for my resume parser, where I should be able to upload an pdf and get the score out of it. Here I just want to see the score, what skills are present, and what skills are missing. and i'm gonna call this as 0 to shipped resume parser. this is gonna be a mock design, so just build html css is fine, no back-end server is needed

i want to convert this entire project into a react project

i want you to  move this react project into frontend folder and build a backend folder that contains the express sever to handle the request, lets connect to mongoDB.

the application should take resume PDF and a JD for comparison, AI part will be added later.

backend folder should contains server.js, routes folder, controller folder, service folder, config folder, middleware folder and utils.js

below is the format to connect to labd ai, lets connect and parse the resume and give the score

Send the conversation so far as messages, each a role (user or assistant) and its content, ending on the user's turn. labd answers once, in JSON: message.content is the reply and credits.percentLeft is what is left of your allowance. Nothing is remembered between requests, so send the earlier turns yourself when you want a conversation.

curl https://agent.thedevlabs.io/v1/api/chat \
  -H "Authorization: Bearer $LABD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Explain closures in one paragraph."}]}'
const res = await fetch('https://agent.thedevlabs.io/v1/api/chat', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.LABD_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Explain closures in one paragraph.' }],
  }),
});
const { message, credits } = await res.json();
console.log(message.content, `${credits.percentLeft}% left`);
Keep the key on a server. labd does not answer browsers on other sites, so a key in a web page is a key anyone viewing it can copy and nothing you can use.
401 the key is wrong or revoked · 402 the allowance is used up · 403 the API is switched off · 429 too many requests this minute, wait and retry.
Every answer spends the same allowance as labd in the portal, your editor and your terminal.
