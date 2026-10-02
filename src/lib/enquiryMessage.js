import { displayTitle } from "./specSummary.js";

const WHATSAPP_NUMBER = "916309933720";

export function enquiryMessage(data, items = []) {
  const name = data.get("name") ?? "";
  const contact = data.get("email") ?? "";
  const request = data.get("message") ?? "";
  const project = data.get("project");
  const selected = items.length
    ? `\n\nProducts in enquiry list:\n${items.map((product) => `- ${displayTitle(product)} (${product.brand})`).join("\n")}`
    : "";
  return ["Hello, I would like to make an enquiry.", `Name: ${name}`, `Email or phone: ${contact}`, project && `Project: ${project}`, `Request:\n${request}${selected}`].filter(Boolean).join("\n\n");
}

export function enquiryUrl(data, items = []) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(enquiryMessage(data, items))}`;
}
