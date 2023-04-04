const lark = require("@larksuiteoapi/node-sdk");

const CONFIG = require("../../config");
const cache = require("../../lib/cache");
const reply = require("../../lib/reply");

function createLarkClient(appId, appSecret) {
  let client = cache[appId];
  if (client) {
    return client;
  }
  client = new lark.Client({
    appId,
    appSecret,
  });
  return client;
}

// {
//   "schema": "2.0",
//   "header": {
//       "event_id": "5e3702a84e847582be8db7fb73283c02",
//       "event_type": "im.message.receive_v1",
//       "create_time": "1608725989000",
//       "token": "rvaYgkND1GOiu5MM0E1rncYC6PLtF7JV",
//       "app_id": "cli_9f5343c580712544",
//       "tenant_key": "2ca1d211f64f6438"
//   },
//    "event": {
//       "sender": {
//           "sender_id": {
//               "union_id": "on_8ed6aa67826108097d9ee143816345",
//               "user_id": "e33ggbyz",
//               "open_id": "ou_84aad35d084aa403a838cf73ee18467"
//           },
//           "sender_type": "user"
//       },
//       "message": {
//           "message_id": "om_5ce6d572455d361153b7cb51da133945",
//           "root_id": "om_5ce6d572455d361153b7cb5xxfsdfsdfdsf",
//           "parent_id": "om_5ce6d572455d361153b7cb5xxfsdfsdfdsf",
//           "create_time": "1609073151345",
//           "chat_id": "oc_5ce6d572455d361153b7xx51da133945",
//           "chat_type": "group",
//           "message_type": "text",
//           "content": "{"text":"@_user_1 hello"}",
//           "mentions": [
//               {
//                   "key": "@_user_1",
//                   "id": {
//                       "union_id": "on_8ed6aa67826108097d9ee143816345",
//                       "user_id": "e33ggbyz",
//                       "open_id": "ou_84aad35d084aa403a838cf73ee18467"
//                   },
//                   "name": "Tom"
//               }
//           ]
//       }
//   }
// }

// TODO: 由于 @larksuiteoapi/node-sdk 中包含 fs 模块，暂时使用 edge function，有时间拆 sdk 换成 serverless function
async function webhook(request, response) {
  const { appId } = request.params;
  const body = request.body || {};
  const app = CONFIG.app[appId];

  console.log(request.body);

  if (!app) {
    response.status = 404;
    return JSON.stringify(`App ${appId} Not Found`);
  }

  const client = createLarkClient(app.appId, app.appSecret);

  if (body.challenge) {
    return JSON.stringify({ challenge: body.challenge });
  }

  const eventId = body.header.event_id;
  if (cache.get(eventId)) {
    return JSON.stringify({
      retry: true,
    });
  }
  cache.set(eventId, true, {
    // 如果飞书没有在规定时间内接收到消息，则会重试，为了防止重试，此时使用缓存来避免次情况
    // 但是它是内存缓存，应用重新部署时会失效
    ttl: 10 * 3600 * 1000,
  });

  if (body.header.event_type === "im.message.receive_v1") {
    const message = body.event.message;
    const text = JSON.parse(message.content).text.replace("@_user_1 ", "");
    const answer = await reply([
      {
        role: "user",
        content: `${app.prompt || ""} ${text}`,
      },
    ]);
    await client.im.message.create({
      params: {
        receive_id_type: "chat_id",
      },
      data: {
        receive_id: message.chat_id,
        content: JSON.stringify({ text: answer }),
        msg_type: "text",
      },
    });
  }

  return JSON.stringify({
    done: true,
  });
}

module.exports = webhook;
