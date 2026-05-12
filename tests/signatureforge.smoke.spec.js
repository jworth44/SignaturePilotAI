import { expect, test } from "@playwright/test";

test.describe("SignatureForge AI smoke tests", () => {
  test.beforeEach(async ({ context, page, baseURL }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: baseURL
    });
    await page.goto("/builder", { waitUntil: "networkidle" });
  });

  test("Free Mode protects branding and locks advanced controls", async ({ page }) => {
    await expect(page).toHaveURL(/\/builder$/);
    await expect(page.locator(".tier-toggle select")).toHaveValue("free");
    await expect(page.locator(".signature-preview-surface")).toContainText("Created with SignatureForge AI");
    await expect(page.getByRole("button", { name: "Copy Signature" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Raw HTML" })).toHaveCount(0);
    await expect(page.locator('label:has-text("Logo size") select')).toBeVisible();
    await expect(page.locator('label:has-text("Logo size") select option[value="extra-large"]')).toHaveAttribute("disabled", "");
    await expect(page.locator('label:has-text("Logo size") select option[value="custom"]')).toHaveAttribute("disabled", "");

    await expect(page.locator('label:has-text("Layout") select')).toBeDisabled();
    await expect(page.locator('label:has-text("Vertical divider") input')).toBeDisabled();
    await expect(page.locator('label:has-text("Remove SignatureForge AI branding") input')).toBeDisabled();

    await page.getByRole("button", { name: "Copy Signature" }).click();
    await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();
    await page.waitForTimeout(150);

    const clipboardPayload = await page.evaluate(async () => {
      const items = await navigator.clipboard.read();
      const summary = { types: [], html: "", text: "" };
      if (!items.length) {
        return summary;
      }

      summary.types = items[0].types;
      if (items[0].types.includes("text/html")) {
        const htmlBlob = await items[0].getType("text/html");
        summary.html = await htmlBlob.text();
      }
      if (items[0].types.includes("text/plain")) {
        const textBlob = await items[0].getType("text/plain");
        summary.text = await textBlob.text();
      }
      return summary;
    });

    expect(clipboardPayload.types).toContain("text/html");
    expect(clipboardPayload.html).toContain("Created with");
    expect(clipboardPayload.html).toContain("SignatureForge AI");
    expect(clipboardPayload.text).toContain("SignatureForge AI");
  });

  test("Pro Mode unlocks controls and can export without footer branding", async ({ page }) => {
    await page.locator(".tier-toggle select").selectOption("pro");

    await expect(page.locator('label:has-text("Layout") select')).toBeEnabled();
    await expect(page.locator('label:has-text("Vertical divider") input')).toBeEnabled();
    await expect(page.locator('label:has-text("Remove SignatureForge AI branding") input')).toBeEnabled();
    await expect(page.getByRole("button", { name: "Copy Signature" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Raw HTML" })).toBeVisible();
    await expect(page.locator('label:has-text("Logo size") select option[value="extra-large"]')).not.toHaveAttribute("disabled", "");
    await expect(page.locator('label:has-text("Logo size") select option[value="custom"]')).not.toHaveAttribute("disabled", "");

    await page.locator('label:has-text("Remove SignatureForge AI branding") input').check();
    await page.locator('label:has-text("Logo size") select').selectOption("custom");
    await page.locator('label:has-text("Custom logo width") input').fill("140");
    await page.getByRole("button", { name: "Copy Raw HTML" }).click();
    await page.waitForTimeout(150);

    const copiedHtml = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiedHtml).not.toContain("Created with SignatureForge AI");
    expect(copiedHtml).toContain('width="140"');
  });

  test("Generated signature keeps core export and layout rules", async ({ page }) => {
    const preview = page.locator(".signature-preview-surface");
    const previewHtml = await preview.innerHTML();

    expect(previewHtml).toContain('href="tel:');
    expect(previewHtml).toContain('href="mailto:');
    expect(previewHtml).toContain('border-collapse:collapse');
    expect(previewHtml).not.toContain('border="1"');
    expect(previewHtml).not.toContain("border:1px solid #");

    const hasHorizontalOverflow = await preview.evaluate((element) => element.scrollWidth > element.clientWidth);
    expect(hasHorizontalOverflow).toBe(false);
  });
});
