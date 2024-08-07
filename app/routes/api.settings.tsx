import { json, LoaderFunctionArgs } from "@remix-run/node";
import { ISettings } from "./app._index";
import { request } from "http";
import { authenticate } from "../shopify.server";
// import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (shop) {
    const session = await prisma.session.findFirst({ where: { shop } });

    if (!session) throw new Error("Invalid Request!");

    const setting = await prisma.setting.findFirst({
      where: { session_id: session.id },
    });

    return json({
      success: true,
      settings: setting ?? {
        accept_label: "Accept",
        decline_label: "Decline",
      },
    });
  }

  return json({ status: "ok" });
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const method = request.method;

  const auth = await authenticate.admin(request);

  switch (method) {
    case "POST":
      let data = await request.json();

      const session = await prisma.session.findFirst({
        where: { accessToken: auth.session.accessToken },
      });

      if (!session) throw new Error("Invalid Request!");

      const setting = await prisma.setting.findFirst({
        where: { session_id: session.id },
      });

      data = { ...data, session_id: session.id };

      if (setting) {
        await prisma.setting.update({ where: { id: setting.id }, data });
      } else {
        await prisma.setting.create({ data });
      }

      return json({ success: true, message: "Settings Updated!" });
  }

  return new Response("Method Not Allowed", { status: 405 });
};
