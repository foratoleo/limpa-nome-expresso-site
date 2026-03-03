"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var mercadopago_exports = {};
__export(mercadopago_exports, {
  default: () => handler
});
module.exports = __toCommonJS(mercadopago_exports);
var import_mercadopago = require("mercadopago");
const client = new import_mercadopago.MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || ""
});
const preference = new import_mercadopago.Preference(client);
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { items, metadata } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Items are required",
        details: "Items must be a non-empty array"
      });
    }
    for (const item of items) {
      if (!item.id || !item.title || !item.quantity || !item.unit_price) {
        return res.status(400).json({
          error: "Invalid item",
          details: "Each item must have id, title, quantity, and unit_price"
        });
      }
      if (item.quantity <= 0 || item.unit_price <= 0) {
        return res.status(400).json({
          error: "Invalid item values",
          details: "Quantity and unit_price must be greater than 0"
        });
      }
    }
    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          currency_id: item.currency_id || "BRL"
        })),
        metadata: metadata || {},
        back_urls: {
          success: `${process.env.VERCEL_URL || "https://limpa-nome-expresso-site.vercel.app"}/checkout/sucesso`,
          failure: `${process.env.VERCEL_URL || "https://limpa-nome-expresso-site.vercel.app"}/checkout/falha`,
          pending: `${process.env.VERCEL_URL || "https://limpa-nome-expresso-site.vercel.app"}/checkout/pendente`
        }
      }
    });
    return res.status(200).json({
      success: true,
      preferenceId: result.id,
      initPoint: result.init_point,
      sandboxInitPoint: result.sandbox_init_point,
      checkoutUrl: result.sandbox_init_point || result.init_point
    });
  } catch (error) {
    console.error("Error creating preference:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      error: "Failed to create payment preference",
      details: errorMessage
    });
  }
}
