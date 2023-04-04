const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const Router = require("koa-router");

const webhook = require("./api/webhook");

const app = new Koa();
const router = new Router();

const ENV = require("./env");
const port = ENV.PORT;

// 使用 koa-bodyparser 中间件来解析 POST 请求体
app.use(bodyParser());

// 定义一个路由来处理 POST 请求
router.post("/api/webhook/:appId", async (ctx) => {
  const res = await webhook(ctx.request, ctx.response);
  // console.log(res);
  ctx.body = res;
});

// 将路由添加到 Koa2 应用中
app.use(router.routes());

app.listen(port, () => {
  console.log("Server is running at http://localhost:%d", port);
});

