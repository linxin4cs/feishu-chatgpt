const CONFIG = require("../config");
const sample = require("midash").sample;

function reply(messages) {
  const apiKey = sample(CONFIG.apiKey);
  return fetch(`${CONFIG.baseURL}/v1/chat/completions`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      model: CONFIG.model,
      messages,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(
        JSON.stringify({
          input: messages,
          output: data,
        })
      );
      return data.choices[0].message.content;
    })
    .catch((e) => {
      console.error(e);
      return "抱歉，我发生了一点小意外。";
    });
}

module.exports = reply;
