import { expect, test, type Page } from "@playwright/test";

/**
 * The improve endpoint is mocked in every test below. Hitting the real one
 * would cost credit, be rate limited, and return different words each run.
 * The live path is covered by lib/improve.smoke.test.ts instead.
 */
const MOCK_RESULT = {
  improvedPrompt:
    "You are a professional tenant. Write an email to my landlord about my broken heater. Include [when it broke].",
  improvements: [
    { label: "Added a role", why: "It writes with the right tone instead of guessing." },
    { label: "Named the format", why: "You get an email you can send, not advice." },
  ],
  intent: "write",
  modelUsed: "anthropic/claude-haiku-4.5",
};

async function mockImprove(page: Page, body: unknown = MOCK_RESULT, status = 200) {
  await page.route("**/api/improve", (route) =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    }),
  );
}

test.describe("home", () => {
  test("shows the hero and the prompt box", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Say it how you'd say it",
    );
    await expect(page.getByLabel("What do you want the AI to do?")).toBeVisible();
  });

  test("blocks submission until the prompt is long enough", async ({ page }) => {
    await page.goto("/");
    const submit = page.getByRole("button", { name: "Mark up my prompt" });

    await expect(submit).toBeDisabled();

    await page.getByLabel("What do you want the AI to do?").fill("hi");
    await expect(submit).toBeDisabled();

    await page.getByLabel("What do you want the AI to do?").fill("fix my resume");
    await expect(submit).toBeEnabled();
  });

  test("fills the box from an example", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /401k/ }).click();
    await expect(page.getByLabel("What do you want the AI to do?")).toHaveValue(
      /401k/,
    );
  });

  test("renders the improved prompt and the margin notes", async ({ page }) => {
    await mockImprove(page);
    await page.goto("/");

    await page.getByLabel("What do you want the AI to do?").fill("email my landlord");
    await page.getByRole("button", { name: "Mark up my prompt" }).click();

    await expect(
      page.getByRole("heading", { name: "Your prompt, marked up" }),
    ).toBeVisible();
    await expect(
      page.getByText(/Write an email to my landlord about my broken heater/),
    ).toBeVisible();

    // The teaching layer is the point — every note must render.
    for (const item of MOCK_RESULT.improvements) {
      await expect(page.getByText(item.label)).toBeVisible();
      await expect(page.getByText(item.why)).toBeVisible();
    }

    // A bracketed blank is explained rather than left to confuse.
    await expect(page.getByText(/blanks are for you to fill in/)).toBeVisible();
  });

  test("shows a readable error instead of a raw failure", async ({ page }) => {
    await mockImprove(page, { error: "The AI service is busy right now." }, 429);
    await page.goto("/");

    await page.getByLabel("What do you want the AI to do?").fill("email my landlord");
    await page.getByRole("button", { name: "Mark up my prompt" }).click();

    // Scoped to main: the Next.js dev overlay also exposes a role="alert".
    await expect(page.getByRole("main").getByRole("alert")).toContainText(
      "busy right now",
    );
  });
});

test.describe("blanks and self-check", () => {
  test("fills a blank into the prompt you take away", async ({ page }) => {
    await mockImprove(page);
    await page.goto("/");

    await page.getByLabel("What do you want the AI to do?").fill("email my landlord");
    await page.getByRole("button", { name: "Mark up my prompt" }).click();

    await expect(page.getByText("1 left to fill.")).toBeVisible();
    await page.getByLabel("Fill in: when it broke").fill("last Tuesday");
    await expect(page.getByText("All filled in.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open in Claude" })).toHaveAttribute(
      "href",
      /last%20Tuesday/,
    );
  });

  test("offers a free self-check before the AI", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Try it yourself first").click();
    await expect(page.getByRole("link", { name: "Who is it for?" })).toBeVisible();
  });
});

test.describe("learn", () => {
  test("lists lessons and opens one", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Nine things worth knowing",
    );

    await page.getByRole("link", { name: /Give it the facts/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Give it the facts",
    );
    await expect(page.getByText("Instead of")).toBeVisible();
  });

  test("old lesson link redirects to the reworked lesson", async ({ page }) => {
    await page.goto("/learn/tell-it-who-to-be");
    await expect(page).toHaveURL(/\/learn\/say-what-angle-you-want$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Say what angle you want",
    );
  });

  test("a lesson with a factual claim shows its source", async ({ page }) => {
    await page.goto("/learn/what-you-type-isnt-private");
    await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Heppner/ })).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("About");
  });
});

test.describe("accessibility basics", () => {
  test("the prompt box is reachable and usable by keyboard", async ({ page }) => {
    await mockImprove(page);
    await page.goto("/");

    const textarea = page.getByLabel("What do you want the AI to do?");
    await textarea.focus();
    await page.keyboard.type("email my landlord");
    await expect(textarea).toHaveValue("email my landlord");

    // Tab to the submit control and activate it without a mouse. Wait for it to
    // enable first, as a person would — typing can land before hydration.
    const submit = page.getByRole("button", { name: "Mark up my prompt" });
    await expect(submit).toBeEnabled();
    await submit.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "Your prompt, marked up" }),
    ).toBeVisible();
  });

  test("every page has exactly one h1 and a main landmark", async ({ page }) => {
    for (const path of ["/", "/learn", "/learn/say-who-it-is-for", "/about"]) {
      await page.goto(path);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    }
  });
});
