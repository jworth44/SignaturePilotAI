import { expect, test } from "@playwright/test";

test.describe("Signature Pilot AI smoke tests", () => {
  test.beforeEach(async ({ context, page, baseURL }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: baseURL
    });
    await page.goto("/builder", { waitUntil: "networkidle" });
  });

  test("Free Mode protects branding and locks advanced controls", async ({ page }) => {
    await expect(page).toHaveURL(/\/builder$/);
    await expect(page.locator(".tier-toggle select")).toHaveValue("free");
    await expect(page.locator(".signature-preview-surface")).toContainText("Created with Signature Pilot AI");
    await expect(page.getByText("Free signatures include Signature Pilot AI branding. Editing/removing branding is a Pro feature.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Signature" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Raw HTML" })).toHaveCount(0);
    await expect(page.locator('label:has-text("Logo size") select')).toBeVisible();
    await expect(page.locator('label:has-text("Logo size") select option[value="extra-large"]')).toHaveAttribute("disabled", "");
    await expect(page.locator('label:has-text("Logo size") select option[value="custom"]')).toHaveAttribute("disabled", "");
    await expect(page.locator('label:has-text("Layout") select option[value="mobile-compact"]')).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Startup Founder" })).toBeVisible();
    await expect(page.getByText("Free Mode includes Executive, Minimal, and Mobile Compact. Contractor and Corporate unlock with Pro.")).toBeVisible();
    await expect(page.getByText("AI Logo Studio is included with Pro. Generate, upload, blend, and refine logo concepts for your signature.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate Logo Concepts" })).toHaveCount(0);
    await expect(page.getByText("Copy Signature: best for Gmail, Outlook, Apple Mail, Yahoo. Copies the finished visual signature.")).toBeVisible();

    await expect(page.locator('label:has-text("Layout") select')).toBeEnabled();
    await page.locator('label:has-text("Layout") select').selectOption("mobile-compact");
    await expect(page.locator(".preview-meta")).toContainText("Mobile Compact");
    await expect(page.locator('label:has-text("Vertical divider") input')).toBeDisabled();
    await expect(page.locator('label:has-text("Remove Signature Pilot AI branding") input')).toBeDisabled();

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
    expect(clipboardPayload.html).toContain('<table cellpadding="0" cellspacing="0" border="0"');
    expect(clipboardPayload.html).toContain("max-width:340px");
    expect(clipboardPayload.html).toContain('<td align="center" valign="top"');
    expect(clipboardPayload.html).toContain('<td align="center" style="border:0;border:none;outline:none;box-shadow:none;padding:0 0 12px 0;">');
    expect(clipboardPayload.html).toContain("Created with");
    expect(clipboardPayload.html).toContain("Signature Pilot AI");
    expect(clipboardPayload.html).toContain('https://signature-forge-ai.vercel.app');
    expect(clipboardPayload.html).toContain("border:none");
    expect(clipboardPayload.html).not.toContain("border-top:");
    expect(clipboardPayload.html).not.toContain("padding:0 0 0 12px");
    expect(clipboardPayload.html).not.toContain("min-width:62px");
    expect(clipboardPayload.text).toContain("Signature Pilot AI");
  });

  test("Pro Mode unlocks controls, AI logo studio works, and exports stay clean", async ({ page }) => {
    await page.locator(".tier-toggle select").selectOption("pro");

    const aiButton = page.getByRole("button", { name: "Generate Signature Suggestions" });
    const buttonMetrics = await aiButton.evaluate((element) => {
      const panel = element.closest(".panel");
      return {
        width: element.getBoundingClientRect().width,
        panelWidth: panel?.getBoundingClientRect().width || 0
      };
    });
    expect(buttonMetrics.width).toBeLessThan(buttonMetrics.panelWidth * 0.9);

    await expect(page.locator('label:has-text("Layout") select')).toBeEnabled();
    await expect(page.locator('label:has-text("Vertical divider") input')).toBeEnabled();
    await expect(page.locator('label:has-text("Remove Signature Pilot AI branding") input')).toBeEnabled();
    await expect(page.getByRole("button", { name: "Copy Signature" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Raw HTML" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate Logo Concepts" })).toBeVisible();
    await expect(page.locator('label:has-text("CTA text") input')).toBeVisible();
    await expect(page.locator('label:has-text("Disclaimer") textarea')).toBeVisible();
    await expect(page.locator('label:has-text("Logo size") select option[value="extra-large"]')).not.toHaveAttribute("disabled", "");
    await expect(page.locator('label:has-text("Logo size") select option[value="custom"]')).not.toHaveAttribute("disabled", "");
    await expect(page.locator('label:has-text("Business type / industry") select')).toBeVisible();

    await page.getByRole("button", { name: "Blend Uploaded Images" }).click();
    await expect(page.getByText("Blend Uploaded Images needs at least one uploaded reference image.")).toBeVisible();
    await page.getByRole("button", { name: "Refine Selected Logo" }).click();
    await expect(page.getByText("Select a logo concept before refining it.")).toBeVisible();

    const logoBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s7h5XQAAAAASUVORK5CYII=",
      "base64"
    );
    await page.locator("#ai-logo-references").setInputFiles({
      name: "reference.png",
      mimeType: "image/png",
      buffer: logoBuffer
    });
    await expect(page.getByAltText("Reference 1")).toBeVisible();

    await page.getByRole("button", { name: "Generate Logo Concepts" }).click();
    await expect(page.getByText("Demo logo concepts generated locally because AI image generation is not configured.")).toBeVisible();
    await expect(page.locator(".logo-concept-card")).toHaveCount(4);
    await page.getByRole("button", { name: "Blend Uploaded Images" }).click();
    await expect(page.getByText("Uploaded references blended into fresh logo concepts.")).toBeVisible();
    await page.getByRole("button", { name: "Select for Signature" }).first().click();
    await expect(page.locator(".signature-preview-surface img")).toHaveAttribute("src", /data:image\/svg\+xml;base64/);
    await page.getByRole("button", { name: "Refine Selected Logo" }).click();
    await expect(page.getByText("Selected logo refined into new concept variations.")).toBeVisible();

    await page.locator('label:has-text("Remove Signature Pilot AI branding") input').check();
    await page.locator('label:has-text("Layout") select').selectOption("mobile-compact");
    await page.locator('label:has-text("Logo size") select').selectOption("custom");
    await page.locator('label:has-text("Custom logo width") input').fill("140");
    await page.getByRole("button", { name: "Copy Raw HTML" }).click();
    await page.waitForTimeout(150);

    const copiedHtml = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiedHtml).not.toContain("Created with Signature Pilot AI");
    expect(copiedHtml).toContain('width="140"');
    expect(copiedHtml).toContain("max-width:340px");
    expect(copiedHtml).toContain('<td align="center" valign="top"');
  });

  test("Suggestions do not auto-overwrite, can be applied selectively, and recovery restores", async ({ page }) => {
    await page.locator(".tier-toggle select").selectOption("pro");
    const originalTitle = await page.locator('label:has-text("Job title") input').inputValue();
    const originalCta = await page.locator('label:has-text("CTA text") input').inputValue();
    const originalDisclaimer = await page.locator('label:has-text("Disclaimer") textarea').inputValue();

    await page.locator('label:has-text("Business type / industry") select').selectOption("Safety Consulting");
    await page.getByRole("button", { name: "Generate Signature Suggestions" }).click();
    await expect(page.getByRole("button", { name: "Apply Suggestions" })).toBeVisible();

    await expect(page.locator('label:has-text("Job title") input')).toHaveValue(originalTitle);
    await expect(page.locator('label:has-text("CTA text") input')).toHaveValue(originalCta);

    await page.getByRole("button", { name: "Apply Only CTA" }).click();
    await expect(page.locator('label:has-text("CTA text") input')).not.toHaveValue(originalCta);
    await expect(page.locator('label:has-text("Job title") input')).toHaveValue(originalTitle);
    await expect(page.locator(".version-card")).toHaveCount(1);

    await page.getByRole("button", { name: "Generate Signature Suggestions" }).click();
    await page.getByRole("button", { name: "Discard Suggestions" }).click();
    await expect(page.locator('label:has-text("CTA text") input')).not.toHaveValue(originalCta);

    await page.getByRole("button", { name: "Generate Signature Suggestions" }).click();
    await page.getByRole("button", { name: "Apply Suggestions" }).click();
    await expect(page.locator('label:has-text("Job title") input')).not.toHaveValue(originalTitle);
    await expect(page.locator('label:has-text("Disclaimer") textarea')).not.toHaveValue(originalDisclaimer);
    await expect(page.locator(".version-card")).toHaveCount(2);

    await page.getByRole("button", { name: "Restore" }).nth(1).click();
    await expect(page.locator('label:has-text("Job title") input')).toHaveValue(originalTitle);
  });

  test("Generated signature keeps core export and layout rules", async ({ page }) => {
    const preview = page.locator(".signature-preview-surface");
    const previewHtml = await preview.innerHTML();

    expect(previewHtml).toContain('href="tel:');
    expect(previewHtml).toContain('href="mailto:');
    expect(previewHtml).toContain('border="0"');
    expect(previewHtml).toContain('border-collapse:collapse');
    expect(previewHtml).toContain("border:none");
    expect(previewHtml).toContain("mso-table-lspace:0pt");
    expect(previewHtml).not.toContain('border="1"');
    expect(previewHtml).not.toContain("border-top:");
    expect(previewHtml).not.toContain("border:1px solid #");

    const hasHorizontalOverflow = await preview.evaluate((element) => element.scrollWidth > element.clientWidth);
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("Homepage stays within the viewport on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(pageOverflow).toBe(false);

    const hero = page.locator(".hero-card");
    await expect(hero).toBeVisible();
    await expect(hero.getByRole("link", { name: "Start Free" })).toBeVisible();
  });

  test("Builder stays usable on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/builder", { waitUntil: "networkidle" });

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(pageOverflow).toBe(false);

    await expect(page.locator(".builder-layout")).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Signature" })).toBeVisible();
    await expect(page.locator('label:has-text("Layout") select')).toHaveValue("mobile-compact");
    await expect(page.getByText("Mobile Compact selected for better mobile email compatibility.")).toBeVisible();

    await page.locator('label:has-text("Layout") select').selectOption("executive");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator('label:has-text("Layout") select')).toHaveValue("executive");
    await expect(page.getByText("Mobile Compact selected for better mobile email compatibility.")).toHaveCount(0);

    await page.locator('label:has-text("Job title") input').fill("Senior Regional Partnerships Director");
    await page.locator('label:has-text("Company name") input').fill("North American Business Development Group");
    await expect(page.getByText("Your title/company may wrap on mobile. Mobile Compact is recommended.")).toBeVisible();

    const previewOverflow = await page.locator(".signature-preview-surface").evaluate((element) => element.scrollWidth > element.clientWidth);
    expect(previewOverflow).toBe(false);
  });
});
