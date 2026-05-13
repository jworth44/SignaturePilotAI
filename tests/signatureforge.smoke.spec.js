import { expect, test } from "@playwright/test";

test.describe("Signature Pilot AI smoke tests", () => {
  test.beforeEach(async ({ context, page, baseURL }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"], {
      origin: baseURL
    });
    await page.goto("/builder", { waitUntil: "networkidle" });
  });

  test("Free Mode protects branding and locks advanced controls in the workspace layout", async ({ page }) => {
    await expect(page).toHaveURL(/\/builder$/);
    await expect(page.locator(".workspace-templates")).toBeVisible();
    await expect(page.locator(".workspace-preview")).toBeVisible();
    await expect(page.locator(".workspace-controls")).toBeVisible();
    await expect(page.locator(".workspace-template-card")).toHaveCount(5);
    await expect(page.getByRole("button", { name: /Professional Classic/ }).first()).toBeVisible();
    await expect(page.locator(".signature-preview-surface")).toContainText("Created with Signature Pilot AI");
    await expect(page.getByText("Logo Pilot AI will help you create, refine, and blend logo concepts.")).toBeVisible();

    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Style", exact: true }).click();
    await expect(page.locator('[aria-label="Preview layout"]')).toBeVisible();
    await expect(page.locator('[aria-label="Preview layout"] option[value="premium-split"]')).toHaveAttribute("disabled", "");
    await expect(page.locator('[aria-label="Preview divider"]')).toBeDisabled();
    await expect(page.locator('[aria-label="Preview branding"]')).toBeDisabled();
    await expect(page.locator('[aria-label="Preview logo size"] option[value="extra-large"]')).toHaveAttribute("disabled", "");
    await expect(page.locator('[aria-label="Preview logo size"] option[value="custom"]')).toHaveAttribute("disabled", "");

    await page.getByRole("button", { name: "Export" }).click();
    await expect(page.getByRole("button", { name: "Copy Signature" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy Raw HTML" })).toHaveCount(0);
    await expect(page.getByText("Free signatures include Signature Pilot AI branding. Editing/removing branding is a Pro feature.")).toBeVisible();

    await page.getByRole("button", { name: "Copy Signature" }).click();
    await expect(page.getByRole("button", { name: "Copied!" })).toBeVisible();

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
    expect(clipboardPayload.html).toContain("Signature Pilot AI");
    expect(clipboardPayload.html).toContain('href="tel:');
    expect(clipboardPayload.html).not.toContain("border-left");
    expect(clipboardPayload.text).toContain("Signature Pilot AI");
  });

  test("Pro Mode unlocks workspace controls and exports clean HTML", async ({ page }) => {
    await page.locator('.workspace-topbar select').selectOption("pro");

    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Style", exact: true }).click();
    await expect(page.locator('[aria-label="Preview layout"]')).toBeVisible();
    await expect(page.locator('[aria-label="Preview divider"]')).toBeEnabled();
    await expect(page.locator('[aria-label="Preview branding"]')).toBeEnabled();
    await expect(page.locator('[aria-label="Preview logo size"] option[value="extra-large"]')).not.toHaveAttribute("disabled", "");
    await expect(page.locator('[aria-label="Preview logo size"] option[value="custom"]')).not.toHaveAttribute("disabled", "");

    await page.locator('[aria-label="Preview layout"]').selectOption("premium-split");
    await page.locator('[aria-label="Preview divider"]').selectOption("on");
    await page.locator('[aria-label="Preview branding"]').selectOption("remove");
    await page.locator('[aria-label="Preview logo size"]').selectOption("custom");
    await page.locator('[aria-label="Preview custom logo width"]').fill("140");

    await expect(page.locator(".preview-meta")).toContainText("Premium");
    await expect(page.locator(".preview-meta")).toContainText("Divider on");
    await expect(page.locator(".signature-preview-surface")).not.toContainText("Created with Signature Pilot AI");

    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Content", exact: true }).click();

    const logoBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9s7h5XQAAAAASUVORK5CYII=",
      "base64"
    );
    await page.locator("#logo-upload").setInputFiles({
      name: "logo.png",
      mimeType: "image/png",
      buffer: logoBuffer
    });
    await expect(page.getByAltText("Logo upload")).toBeVisible();

    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Export", exact: true }).click();
    await expect(page.getByRole("button", { name: "Copy Raw HTML" })).toBeVisible();
    await page.getByRole("button", { name: "Copy Raw HTML" }).click();

    const copiedHtml = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiedHtml).not.toContain("Created with Signature Pilot AI");
    expect(copiedHtml).toContain('width="140"');
    expect(copiedHtml).toContain("Premium split layout");
    expect(copiedHtml).toContain("width:18px;padding:0 12px");
  });

  test("AI tab does not auto-overwrite, can be applied selectively, and recovery restores", async ({ page }) => {
    await page.locator('.workspace-topbar select').selectOption("pro");
    const originalTitle = await page.locator('label:has-text("Job title") input').inputValue();
    const originalCta = await page.locator('label:has-text("CTA text") input').inputValue();
    const originalDisclaimer = await page.locator('label:has-text("Disclaimer") textarea').inputValue();

    await page.locator(".workspace-control-tabs").getByRole("button", { name: "AI", exact: true }).click();
    await page.locator('label:has-text("Business type / industry") select').selectOption("Safety Consulting");
    await page.getByRole("button", { name: "Generate Signature Suggestions" }).click();
    await expect(page.getByRole("button", { name: "Apply Suggestions" })).toBeVisible();

    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Content", exact: true }).click();
    await expect(page.locator('label:has-text("Job title") input')).toHaveValue(originalTitle);
    await expect(page.locator('label:has-text("CTA text") input')).toHaveValue(originalCta);
    await page.locator(".workspace-control-tabs").getByRole("button", { name: "AI", exact: true }).click();

    await page.getByRole("button", { name: "Apply Only CTA" }).click();
    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Content", exact: true }).click();
    await expect(page.locator('label:has-text("CTA text") input')).not.toHaveValue(originalCta);
    await expect(page.locator('label:has-text("Job title") input')).toHaveValue(originalTitle);
    await page.locator(".workspace-control-tabs").getByRole("button", { name: "AI", exact: true }).click();
    await expect(page.locator(".version-card")).toHaveCount(1);

    await page.getByRole("button", { name: "Generate Signature Suggestions" }).click();
    await page.getByRole("button", { name: "Discard Suggestions" }).click();
    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Content", exact: true }).click();
    await expect(page.locator('label:has-text("CTA text") input')).not.toHaveValue(originalCta);
    await page.locator(".workspace-control-tabs").getByRole("button", { name: "AI", exact: true }).click();

    await page.getByRole("button", { name: "Generate Signature Suggestions" }).click();
    await page.getByRole("button", { name: "Apply Suggestions" }).click();
    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Content", exact: true }).click();
    await expect(page.locator('label:has-text("Job title") input')).not.toHaveValue(originalTitle);
    await expect(page.locator('label:has-text("Disclaimer") textarea')).not.toHaveValue(originalDisclaimer);
    await page.locator(".workspace-control-tabs").getByRole("button", { name: "AI", exact: true }).click();
    await expect(page.locator(".version-card")).toHaveCount(2);

    await page.getByRole("button", { name: "Restore" }).nth(1).click();
    await expect(page.locator('label:has-text("Job title") input')).toHaveValue(originalTitle);
  });

  test("Generated signature keeps core export and layout rules", async ({ page }) => {
    await page.locator('.workspace-topbar select').selectOption("pro");
    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Style", exact: true }).click();
    const layouts = ["classic", "minimal", "corporate", "premium-split", "mobile-compact"];

    for (const layout of layouts) {
      await page.locator('[aria-label="Preview layout"]').selectOption(layout);
      if (layout !== "mobile-compact") {
        await page.locator('[aria-label="Preview divider"]').selectOption("off");
      }

      const previewHtml = await page.locator(".signature-preview-surface").innerHTML();
      expect(previewHtml).toContain('href="tel:');
      expect(previewHtml).toContain('href="mailto:');
      expect(previewHtml).toContain('border="0"');
      expect(previewHtml).toContain("border-collapse:collapse");
      expect(previewHtml).toContain("border:none");
      expect(previewHtml).not.toContain("border-left");
    }
  });

  test("Desktop builder fits the viewport without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/builder", { waitUntil: "networkidle" });

    await expect(page.locator(".workspace-templates")).toBeVisible();
    await expect(page.locator(".workspace-preview")).toBeVisible();
    await expect(page.locator(".workspace-controls")).toBeVisible();

    const layout = await page.evaluate(() => {
      const root = document.documentElement;
      const controls = document.querySelector(".workspace-controls")?.getBoundingClientRect();
      const preview = document.querySelector(".workspace-preview")?.getBoundingClientRect();
      const previewStage = document.querySelector(".workspace-email-stage");

      return {
        scrollWidth: root.scrollWidth,
        innerWidth: window.innerWidth,
        controlsRight: controls?.right ?? 0,
        controlsLeft: controls?.left ?? 0,
        previewRight: preview?.right ?? 0,
        previewOverflow: previewStage ? previewStage.scrollWidth > previewStage.clientWidth : true
      };
    });

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
    expect(layout.controlsLeft).toBeGreaterThanOrEqual(0);
    expect(layout.controlsRight).toBeLessThanOrEqual(layout.innerWidth + 1);
    expect(layout.previewRight).toBeLessThanOrEqual(layout.innerWidth + 1);
    expect(layout.previewOverflow).toBe(false);
  });

  test("Homepage stays within the viewport on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(pageOverflow).toBe(false);

    await expect(page.locator(".hero-card")).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Start Free" })).toBeVisible();
  });

  test("Builder uses mobile workspace tabs without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/builder", { waitUntil: "networkidle" });

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(pageOverflow).toBe(false);

    await expect(page.locator(".workspace-mobile-tabs")).toBeVisible();
    await expect(page.locator(".workspace-preview")).toBeVisible();
    await expect(page.locator('[aria-label="Preview layout"]').first()).toBeHidden();

    await page.locator(".workspace-mobile-tabs").getByRole("button", { name: "Edit", exact: true }).click();
    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Style", exact: true }).click();
    await expect(page.locator('[aria-label="Preview layout"]')).toHaveValue("mobile-compact");
    await expect(page.getByText("Mobile Compact selected for better mobile email compatibility.")).toBeVisible();

    await page.locator(".workspace-mobile-tabs").getByRole("button", { name: "Export", exact: true }).click();
    await expect(page.getByRole("button", { name: "Copy Signature" })).toBeVisible();

    await page.locator(".workspace-mobile-tabs").getByRole("button", { name: "Templates", exact: true }).click();
    await expect(page.locator(".workspace-template-card")).toHaveCount(5);
  });

  test("Revert to original restores the original draft state", async ({ page }) => {
    const originalName = await page.locator('label:has-text("Full name") input').inputValue();

    await page.locator('label:has-text("Full name") input').fill("Taylor Rivers");
    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Style", exact: true }).click();
    await page.locator('[aria-label="Preview layout"]').selectOption("mobile-compact");
    await page.getByRole("button", { name: "Revert to Original" }).click();

    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Content", exact: true }).click();
    await expect(page.locator('label:has-text("Full name") input')).toHaveValue(originalName);
    await page.locator(".workspace-control-tabs").getByRole("button", { name: "Style", exact: true }).click();
    await expect(page.locator('[aria-label="Preview layout"]')).toHaveValue("classic");
    await expect(page.locator("p").filter({ hasText: "Reverted to the original signature." }).first()).toBeVisible();
  });
});
