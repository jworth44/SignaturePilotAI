import { expect, test } from "@playwright/test";

async function openDisclosureIfCollapsed(page, namePattern) {
  const toggle = page.getByRole("button", { name: namePattern });
  if ((await toggle.getAttribute("aria-expanded")) === "false") {
    await toggle.click();
  }
}

test.describe("Signature Pilot AI step studio smoke tests", () => {
  test.beforeEach(async ({ context, page, baseURL }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: baseURL
    });
    await page.goto("/builder", { waitUntil: "networkidle" });
  });

  test("Start Faster preserves existing identity details and shows the new starter set", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Professional" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Senior Management" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Office Administration" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Contractor" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrepreneur" })).toBeVisible();

    await page.locator('label:has-text("Full name*") input').fill("Alex Custom");
    await page.locator('label:has-text("Office phone number") input').fill("555-222-1111");
    await page.locator('label:has-text("Email address*") input').fill("alex@example.com");
    await page.locator('label:has-text("Company name*") input').fill("Custom Company");
    await page.locator('label:has-text("Website URL") input').fill("customsite.com");
    await page.locator('label:has-text("Job title*") input').fill("Operations Lead");

    await page.getByRole("button", { name: "Contractor" }).click();

    await expect(page.locator('label:has-text("Full name*") input')).toHaveValue("Alex Custom");
    await expect(page.locator('label:has-text("Office phone number") input')).toHaveValue("555-222-1111");
    await expect(page.locator('label:has-text("Email address*") input')).toHaveValue("alex@example.com");
    await expect(page.locator('label:has-text("Company name*") input')).toHaveValue("Custom Company");
    await expect(page.locator('label:has-text("Website URL") input')).toHaveValue("customsite.com");
    await expect(page.locator('label:has-text("Job title*") input')).toHaveValue("Operations Lead");
    await expect(page.getByText("Starter applied without replacing your existing contact details.")).toBeVisible();
    await page.getByRole("button", { name: /Styles/ }).click();
    await expect(page.locator('label:has-text("CTA text") input')).toHaveValue("Request site walkthrough");
  });

  test("Preview device buttons and zoom change the live preview state", async ({ page }) => {
    const stage = page.locator(".workspace-email-stage");
    await expect(stage).toHaveAttribute("data-preview-device", "desktop");
    await expect(stage).toHaveAttribute("data-preview-zoom", "100");

    await page.getByRole("button", { name: "Mobile" }).click();
    await expect(stage).toHaveAttribute("data-preview-device", "mobile");

    await page.getByLabel("Preview zoom").selectOption("125");
    await expect(stage).toHaveAttribute("data-preview-zoom", "125");
    await expect(page.locator(".preview-meta")).toContainText("Variant 1 of 12");
  });

  test("Template step exposes 12 template families and variant controls", async ({ page }) => {
    await page.getByRole("button", { name: /Templates/ }).click();

    await expect(page.locator(".generator-template-card")).toHaveCount(12);
    await expect(page.locator(".generator-template-card", { hasText: "Professional Classic" }).first()).toBeVisible();
    await expect(page.locator(".generator-template-card", { hasText: "Executive Corporate" }).first()).toBeVisible();
    await expect(page.locator(".generator-template-card", { hasText: "Signature Card" }).first()).toBeVisible();

    const previewHtmlBefore = await page.locator(".signature-preview-surface").innerHTML();
    await expect(page.locator(".generator-template-toolbar")).toContainText("Professional Classic - Variant 1 of 12");

    await page.getByRole("button", { name: "Regenerate layout" }).click();
    await expect(page.locator(".generator-template-toolbar")).toContainText("Professional Classic - Variant 2 of 12");

    const previewHtmlAfter = await page.locator(".signature-preview-surface").innerHTML();
    expect(previewHtmlAfter).not.toBe(previewHtmlBefore);

    await page.getByRole("button", { name: "Revert template" }).click();
    await expect(page.locator(".generator-template-toolbar")).toContainText("Professional Classic - Variant 1 of 12");
  });

  test("Pro mode exports reflect selected family and variant changes", async ({ page }) => {
    await page.locator(".generator-mode-field select").selectOption("pro");
    await page.getByRole("button", { name: /Templates/ }).click();

    await page.locator(".generator-template-card", { hasText: "Executive Corporate" }).getByRole("button", { name: "Select" }).click();
    await expect(page.locator(".preview-meta")).toContainText("Executive Corporate");
    await expect(page.locator(".signature-preview-surface")).not.toContainText("Executive Corporate");

    await page.getByRole("button", { name: /Export/ }).click();
    await openDisclosureIfCollapsed(page, /More export options/i);
    await page.getByRole("button", { name: "Copy Raw HTML" }).click();
    const firstHtml = await page.evaluate(() => navigator.clipboard.readText());
    expect(firstHtml).not.toContain("Executive Corporate");

    await page.getByRole("button", { name: /Templates/ }).click();
    await page.getByRole("button", { name: "Regenerate layout" }).click();
    await expect(page.locator(".generator-template-toolbar")).toContainText("Executive Corporate - Variant 2 of 12");

    await page.getByRole("button", { name: /Export/ }).click();
    await openDisclosureIfCollapsed(page, /More export options/i);
    await page.getByRole("button", { name: "Copy Raw HTML" }).click();
    const secondHtml = await page.evaluate(() => navigator.clipboard.readText());

    expect(secondHtml).not.toBe(firstHtml);

    await page.getByRole("button", { name: /Styles/ }).click();
    await openDisclosureIfCollapsed(page, /Advanced options/i);
    await page.locator('label:has-text("Show template tags") select').selectOption("on");
    await expect(page.locator(".signature-preview-surface")).toContainText("Executive Corporate");

    await page.getByRole("button", { name: /Export/ }).click();
    await openDisclosureIfCollapsed(page, /More export options/i);
    await page.getByRole("button", { name: "Copy Raw HTML" }).click();
    const taggedHtml = await page.evaluate(() => navigator.clipboard.readText());
    expect(taggedHtml).toContain("Executive Corporate");

    await page.getByRole("button", { name: "Copy Signature" }).click();
    await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
  });

  test("CTA destination validation and export preserve real scheduling links", async ({ page }) => {
    await page.locator(".generator-mode-field select").selectOption("pro");
    await page.getByRole("button", { name: /Styles/ }).click();

    await page.locator('label:has-text("CTA Destination Type") select').selectOption("teams");
    await expect(page.getByText("CTA URL is required when a destination type is selected.")).toBeVisible();

    await page.locator('label:has-text("CTA text") input').fill("Book Teams meeting");
    await page.locator('label:has-text("CTA URL") input').fill("teams.microsoft.com/l/meetup-join/example");
    await expect(page.getByText("CTA URL is required when a destination type is selected.")).toHaveCount(0);

    await expect(page.locator(".signature-preview-surface a", { hasText: "Book Teams meeting" })).toHaveAttribute(
      "href",
      /https:\/\/teams\.microsoft\.com\/l\/meetup-join\/example/
    );

    await page.getByRole("button", { name: /Export/ }).click();
    await openDisclosureIfCollapsed(page, /More export options/i);
    await page.getByRole("button", { name: "Copy Raw HTML" }).click();
    const teamsHtml = await page.evaluate(() => navigator.clipboard.readText());
    expect(teamsHtml).toContain('href="https://teams.microsoft.com/l/meetup-join/example"');
    expect(teamsHtml).toContain('title="https://teams.microsoft.com/l/meetup-join/example"');

    await page.getByRole("button", { name: "Copy Plain Text" }).click();
    const plainText = await page.evaluate(() => navigator.clipboard.readText());
    expect(plainText).toContain("Book Teams meeting: https://teams.microsoft.com/l/meetup-join/example");

    await page.getByRole("button", { name: /Styles/ }).click();
    await page.locator('label:has-text("CTA Destination Type") select').selectOption("calendly");
    await page.locator('label:has-text("CTA URL") input').fill("https://calendly.com/yourname");
    await expect(page.locator(".signature-preview-surface a", { hasText: "Book Teams meeting" })).toHaveAttribute(
      "href",
      "https://calendly.com/yourname"
    );

    await page.locator('label:has-text("CTA Destination Type") select').selectOption("none");
    await expect(page.locator(".signature-preview-surface a", { hasText: "Book Teams meeting" })).toHaveCount(0);
  });

  test("Template tag decorations disappear fully when tags are off and return when enabled", async ({ page }) => {
    await page.locator(".generator-mode-field select").selectOption("pro");
    await page.getByRole("button", { name: /Templates/ }).click();
    await page.locator(".generator-template-card", { hasText: "Contractor Bold" }).getByRole("button", { name: "Select" }).click();

    await page.getByRole("button", { name: /Export/ }).click();
    await page.getByRole("button", { name: /More export options/i }).click();
    await page.getByRole("button", { name: "Copy Raw HTML" }).click();
    const defaultHtml = await page.evaluate(() => navigator.clipboard.readText());

    expect(defaultHtml).not.toContain("Contractor Bold");
    expect(defaultHtml).not.toContain("max-width:120px;height:6px");
    expect(defaultHtml).not.toContain("display:inline-block;padding:4px 10px;border-radius:999px");

    await page.getByRole("button", { name: /Styles/ }).click();
    await openDisclosureIfCollapsed(page, /Advanced options/i);
    await page.locator('label:has-text("Show template tags") select').selectOption("on");

    await page.getByRole("button", { name: /Export/ }).click();
    await openDisclosureIfCollapsed(page, /More export options/i);
    await page.getByRole("button", { name: "Copy Raw HTML" }).click();
    const taggedHtml = await page.evaluate(() => navigator.clipboard.readText());

    expect(taggedHtml).toContain("Contractor Bold");
    expect(taggedHtml).toContain("max-width:120px;height:6px");
    expect(taggedHtml).toContain("display:inline-block;padding:4px 10px;border-radius:999px");
  });

  test("Desktop builder fits without horizontal overflow and the right preview pane stays visible", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/builder", { waitUntil: "networkidle" });

    const layout = await page.evaluate(() => {
      const root = document.documentElement;
      const preview = document.querySelector(".generator-preview-pane")?.getBoundingClientRect();
      return {
        scrollWidth: root.scrollWidth,
        innerWidth: window.innerWidth,
        previewRight: preview?.right ?? 0
      };
    });

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
    expect(layout.previewRight).toBeLessThanOrEqual(layout.innerWidth + 1);
  });

  test("Mobile builder remains usable without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/builder", { waitUntil: "networkidle" });

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(pageOverflow).toBe(false);

    await page.getByRole("button", { name: /Export/ }).click();
    await expect(page.getByRole("button", { name: "Copy Signature" })).toBeVisible();
  });
});
