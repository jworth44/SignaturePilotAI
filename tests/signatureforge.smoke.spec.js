import { expect, test } from "@playwright/test";

test.describe("Signature Pilot AI generator smoke tests", () => {
  test.beforeEach(async ({ context, page, baseURL }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: baseURL
    });
    await page.goto("/builder", { waitUntil: "networkidle" });
  });

  test("Free mode shows the ethical HubSpot-style builder flow with uploads", async ({ page }) => {
    await expect(page).toHaveURL(/\/builder$/);
    await expect(page.locator(".generator-step-rail")).toBeVisible();
    await expect(page.locator(".generator-editor-pane")).toBeVisible();
    await expect(page.locator(".generator-preview-pane")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Enter your signature details" })).toBeVisible();
    await expect(page.locator(".signature-preview-surface")).toContainText("Created with Signature Pilot AI");

    await page.getByRole("button", { name: /Images/ }).click();
    await expect(page.getByRole("heading", { name: "Upload your logo or profile image" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Company Logo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Profile Picture" })).toBeVisible();
    await expect(page.getByText("Use direct file uploads here instead of image links.")).toBeVisible();

    await page.getByRole("button", { name: /Templates/ }).click();
    await expect(page.locator(".generator-template-card")).toHaveCount(5);
    await expect(page.getByRole("button", { name: "Use this style" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Pro style" }).first()).toBeVisible();

    await page.getByRole("button", { name: /Styles/ }).click();
    await expect(page.locator('label:has-text("Layout") select option[value="premium-split"]')).toHaveAttribute("disabled", "");
    await expect(page.locator('label:has-text("Divider") select')).toBeDisabled();
    await expect(page.locator('label:has-text("Branding") select')).toBeDisabled();

    await page.getByRole("button", { name: /Export/ }).click();
    await expect(page.getByRole("button", { name: "Copy Signature" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Raw HTML" })).toHaveCount(0);
  });

  test("Pro mode unlocks uploads, template switching, polish, and clean export", async ({ page }) => {
    await page.locator('.generator-builder-topactions select').selectOption("pro");

    await page.getByRole("button", { name: /Images/ }).click();
    const logoBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s7h5XQAAAAASUVORK5CYII=",
      "base64"
    );
    await page.locator("#logo-upload").setInputFiles({
      name: "logo.png",
      mimeType: "image/png",
      buffer: logoBuffer
    });
    await expect(page.getByAltText("Company Logo")).toBeVisible();

    await page.getByRole("button", { name: /Templates/ }).click();
    await page.locator(".generator-template-card", { hasText: "Corporate" }).getByRole("button", { name: "Use this style" }).click();
    await expect(page.locator(".preview-meta")).toContainText("Corporate");

    await page.getByRole("button", { name: /Styles/ }).click();
    await page.locator('label:has-text("Layout") select').selectOption("premium-split");
    await page.locator('label:has-text("Divider") select').selectOption("on");
    await page.locator('label:has-text("Branding") select').selectOption("remove");
    await page.locator('label:has-text("Logo size") select').selectOption("custom");
    await page.locator('label:has-text("Custom logo width") input').fill("140");
    await page.getByRole("button", { name: "Preview one-click polish" }).click();
    await expect(page.getByText("Polished title line")).toBeVisible();
    await page.getByRole("button", { name: "Apply one-click polish" }).click();

    await page.getByRole("button", { name: /Export/ }).click();
    await expect(page.getByRole("button", { name: "Copy Raw HTML" })).toBeVisible();
    await page.getByRole("button", { name: "Copy Raw HTML" }).click();

    const copiedHtml = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiedHtml).not.toContain("Created with Signature Pilot AI");
    expect(copiedHtml).toContain('width="140"');
    expect(copiedHtml).toContain("Premium split layout");
    expect(copiedHtml).toContain("width:18px;padding:0 12px");
  });

  test("Built-in smart suggestions still do not auto-overwrite current draft", async ({ page }) => {
    await page.locator('.generator-builder-topactions select').selectOption("pro");

    const originalTitle = await page.locator('label:has-text("Job title*") input').inputValue();
    await page.getByRole("button", { name: /Styles/ }).click();
    const originalCta = await page.locator('label:has-text("CTA text") input').inputValue();

    await page.locator('label:has-text("Business type / industry") select').selectOption("Safety Consulting");
    await page.getByRole("button", { name: "Generate Signature Suggestions" }).click();
    await expect(page.getByRole("button", { name: "Apply Suggestions" })).toBeVisible();
    await expect(page.locator('label:has-text("CTA text") input')).toHaveValue(originalCta);

    await page.getByRole("button", { name: "Apply Only CTA" }).click();
    await expect(page.locator('label:has-text("CTA text") input')).not.toHaveValue(originalCta);
    await page.getByRole("button", { name: /Details/ }).click();
    await expect(page.locator('label:has-text("Job title*") input')).toHaveValue(originalTitle);
  });

  test("Generated signature keeps export safety rules across layouts", async ({ page }) => {
    await page.locator('.generator-builder-topactions select').selectOption("pro");
    await page.getByRole("button", { name: /Styles/ }).click();
    const layouts = ["classic", "minimal", "corporate", "premium-split", "mobile-compact"];
    const previews = [];

    for (const layout of layouts) {
      await page.locator('label:has-text("Layout") select').selectOption(layout);
      if (layout !== "mobile-compact") {
        await page.locator('label:has-text("Divider") select').selectOption("off");
      }

      const previewHtml = await page.locator(".signature-preview-surface").innerHTML();
      expect(previewHtml).toContain('href="tel:');
      expect(previewHtml).toContain('href="mailto:');
      expect(previewHtml).toContain('border="0"');
      expect(previewHtml).toContain("border-collapse:collapse");
      expect(previewHtml).toContain("border:none");
      expect(previewHtml).not.toContain("border-left");
      previews.push(previewHtml);
    }

    expect(new Set(previews).size).toBeGreaterThan(2);
  });

  test("Desktop builder fits without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/builder", { waitUntil: "networkidle" });

    await expect(page.locator(".generator-editor-pane")).toBeVisible();
    await expect(page.locator(".generator-preview-pane")).toBeVisible();

    const layout = await page.evaluate(() => {
      const root = document.documentElement;
      const preview = document.querySelector(".generator-preview-pane")?.getBoundingClientRect();
      const editor = document.querySelector(".generator-editor-pane")?.getBoundingClientRect();
      return {
        scrollWidth: root.scrollWidth,
        innerWidth: window.innerWidth,
        previewRight: preview?.right ?? 0,
        editorLeft: editor?.left ?? 0
      };
    });

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
    expect(layout.previewRight).toBeLessThanOrEqual(layout.innerWidth + 1);
    expect(layout.editorLeft).toBeGreaterThanOrEqual(0);
  });

  test("Homepage stays within the viewport on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(pageOverflow).toBe(false);

    await expect(page.locator(".hero-card")).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Start Free" })).toBeVisible();
  });

  test("Mobile builder keeps the step flow usable without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/builder", { waitUntil: "networkidle" });

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(pageOverflow).toBe(false);

    await expect(page.locator(".generator-step-rail")).toBeVisible();
    await page.getByRole("button", { name: /Templates/ }).click();
    await expect(page.locator(".generator-template-card")).toHaveCount(5);
    await page.getByRole("button", { name: /Export/ }).click();
    await expect(page.getByRole("button", { name: "Copy Signature" })).toBeVisible();
  });
});
