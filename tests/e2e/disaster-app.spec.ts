import { expect, Page, test } from "@playwright/test";

type RoleKey = "admin" | "citizen" | "rescueCenter" | "rescueTeam";
type MissionStatus = "Assigned" | "In Progress" | "Completed";

const ACCOUNTS = {
  admin: {
    email: process.env.ADMIN_EMAIL ?? "admin@rescue.local",
    password: process.env.ADMIN_PASSWORD ?? "Admin@123",
    dashboardPath: "/admin/dashboard",
  },
  citizen: {
    email:
      process.env.CITIZEN_EMAIL ?? process.env.USER_EMAIL ?? "citizen@rescue.local",
    password:
      process.env.CITIZEN_PASSWORD ?? process.env.USER_PASSWORD ?? "Citizen@123",
    dashboardPath: "/citizen/dashboard",
  },
  rescueCenter: {
    email: process.env.RESCUE_CENTER_EMAIL ?? "center@rescue.local",
    password: process.env.RESCUE_CENTER_PASSWORD ?? "Center@123",
    dashboardPath: "/rescue-center/dashboard",
  },
  rescueTeam: {
    email: process.env.RESCUE_TEAM_EMAIL ?? "team@rescue.local",
    password: process.env.RESCUE_TEAM_PASSWORD ?? "Team@123",
    dashboardPath: "/rescue-team/dashboard",
  },
} as const;

async function loginAs(page: Page, role: RoleKey) {
  const account = ACCOUNTS[role];
  await page.goto("/login");
  await page.getByTestId("login-email").fill(account.email);
  await page.getByTestId("login-password").fill(account.password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(new RegExp(`${account.dashboardPath}$`));
  await expect(page.getByTestId("dashboard-page")).toBeVisible();
}

async function logout(page: Page) {
  await page.getByTestId("logout-button").click();
  await expect(page).toHaveURL(/\/login$/);
}

async function createAlertViaForm(
  page: Page,
  title: string,
  description: string,
  location: string,
) {
  const titleInput = page.getByTestId("alert-title");
  if ((await titleInput.count()) === 0) {
    const toggleButton = page.getByTestId("toggle-alert-form");
    if ((await toggleButton.count()) > 0) {
      await toggleButton.click();
    }
  }

  await expect(page.getByTestId("alert-title")).toBeVisible();
  await page.getByTestId("alert-title").fill(title);
  await page.getByTestId("alert-description").fill(description);
  await page.getByTestId("alert-location").fill(location);
  await page.getByTestId("alert-submit").click();
}

test.describe("Authentication and Routing", () => {
  test("Unauthorized users are redirected to login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-page")).toBeVisible();
  });

  test("Invalid login shows an error message", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("invalid@rescue.local");
    await page.getByTestId("login-password").fill("wrong-password");
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("Legacy coordinator credentials are rejected", async ({ page }) => {
    await page.goto("/login");
    await page
      .getByTestId("login-email")
      .fill(process.env.COORDINATOR_EMAIL ?? "coordinator@rescue.local");
    await page
      .getByTestId("login-password")
      .fill(process.env.COORDINATOR_PASSWORD ?? "Rescue@123");
    await page.getByTestId("login-submit").click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-error")).toHaveText(
      "Invalid email or password.",
    );
  });

  test("Signup creates a new citizen and redirects to citizen dashboard", async ({
    page,
  }) => {
    const unique = Date.now();
    await page.goto("/signup");
    await page.getByTestId("signup-name").fill("Playwright Citizen");
    await page
      .getByTestId("signup-email")
      .fill(`pw-citizen-${unique}@rescue.local`);
    await page.getByTestId("signup-password").fill("Citizen@123");
    await page.getByTestId("signup-role").selectOption("citizen");
    await page.getByTestId("signup-submit").click();

    await expect(page).toHaveURL(/\/citizen\/dashboard$/);
    await expect(page.getByTestId("dashboard-page")).toBeVisible();
  });

  test("Role-based login redirects admin to admin dashboard", async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("Role-based login redirects citizen to citizen dashboard", async ({ page }) => {
    await loginAs(page, "citizen");
  });

  test("Role-based login redirects rescue center to rescue center dashboard", async ({
    page,
  }) => {
    await loginAs(page, "rescueCenter");
  });

  test("Role-based login redirects rescue team to rescue team dashboard", async ({
    page,
  }) => {
    await loginAs(page, "rescueTeam");
  });

  test("Cross-role protection redirects to user's own dashboard", async ({ page }) => {
    await loginAs(page, "citizen");
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/citizen\/dashboard$/);

    await page.goto("/rescue-team/dashboard");
    await expect(page).toHaveURL(/\/citizen\/dashboard$/);
  });
});

test.describe("Role Responsibilities and RBAC", () => {
  test("Citizen can report and update own alert but cannot resolve it", async ({ page }) => {
    await loginAs(page, "citizen");

    const title = `Citizen report ${Date.now()}`;
    await createAlertViaForm(
      page,
      title,
      "Water level rising rapidly near school buildings.",
      "Sector 11",
    );

    const alertCard = page.getByTestId("alert-item").filter({ hasText: title }).first();
    await expect(alertCard).toBeVisible();
    await expect(alertCard.locator('button:has-text("Mark as Resolved")')).toHaveCount(0);
    await expect(alertCard.locator('button[title="Edit Alert"]')).toHaveCount(1);
    await expect(alertCard.locator('button[title="Delete Alert"]')).toHaveCount(1);
  });

  test("Rescue center can edit incoming alerts from citizens", async ({ page }) => {
    const originalTitle = `Center-edit ${Date.now()}`;

    await loginAs(page, "citizen");
    await createAlertViaForm(
      page,
      originalTitle,
      "Initial citizen report for center triage.",
      "Sector 3",
    );
    await logout(page);

    await loginAs(page, "rescueCenter");
    await page.goto("/rescue-center/incoming-alerts");

    const card = page.getByTestId("alert-item").filter({ hasText: originalTitle }).first();
    await expect(card).toBeVisible();
    await card.locator('button[title="Edit Alert"]').click();

    const updatedTitle = `${originalTitle} (Validated)`;
    await page.locator('input[placeholder="Title"]').first().fill(updatedTitle);
    await page.getByRole("button", { name: "Save" }).first().click();

    await expect(page.getByTestId("alert-item").filter({ hasText: updatedTitle }).first()).toBeVisible();
  });

  test("Rescue team cannot create alerts but can resolve active incidents", async ({
    page,
  }) => {
    const title = `Team-resolve ${Date.now()}`;

    await loginAs(page, "admin");
    await createAlertViaForm(
      page,
      title,
      "Need field response confirmation.",
      "North Bridge",
    );
    await logout(page);

    await loginAs(page, "rescueTeam");
    await expect(page.getByTestId("alert-submit")).toHaveCount(0);

    const createResponse = await page.request.post("/api/alerts", {
      data: {
        title: "Team created alert",
        description: "Should not be allowed",
        location: "Blocked",
      },
    });
    expect(createResponse.status()).toBe(403);

    const alertCard = page.getByTestId("alert-item").filter({ hasText: title }).first();
    await expect(alertCard).toBeVisible();
    await alertCard.getByRole("button", { name: "Mark as Resolved" }).click();
    await expect(alertCard).toContainText("Resolved");
  });

  test("Rescue center can assign an active alert to an available rescue team", async ({
    page,
  }) => {
    const title = `Center-assignment ${Date.now()}`;

    await loginAs(page, "citizen");
    await createAlertViaForm(
      page,
      title,
      "Assignment workflow validation alert.",
      "Sector 12",
    );
    await logout(page);

    await loginAs(page, "rescueCenter");
    const missionsResponse = await page.request.get("/api/missions");
    expect(missionsResponse.status()).toBe(200);

    const missionsPayload = (await missionsResponse.json()) as {
      missions: Array<{
        id: string;
        status: MissionStatus;
        assignedTeamEmail: string;
      }>;
    };
    const rescueTeamEmail = ACCOUNTS.rescueTeam.email;
    const activeRescueTeamMissions = missionsPayload.missions.filter(
      (mission) =>
        mission.assignedTeamEmail === rescueTeamEmail &&
        mission.status !== "Completed",
    );

    for (const mission of activeRescueTeamMissions) {
      const completeResponse = await page.request.patch(`/api/missions/${mission.id}`, {
        data: { status: "Completed" as MissionStatus },
      });
      expect(completeResponse.status()).toBe(200);
    }

    const markAvailableResponse = await page.request.patch("/api/rescue-teams", {
      data: { teamEmail: rescueTeamEmail, status: "available" as const },
    });
    expect(markAvailableResponse.status()).toBe(200);

    await page.goto("/rescue-center/assignments");
    await expect(page.getByTestId("team-status-list")).toBeVisible();

    const alertsResponse = await page.request.get("/api/alerts");
    expect(alertsResponse.status()).toBe(200);
    const alertsPayload = (await alertsResponse.json()) as {
      alerts: Array<{ id: string; title: string }>;
    };
    const assignedAlert = alertsPayload.alerts.find((alert) => alert.title === title);
    expect(assignedAlert).toBeDefined();

    const alertSelect = page.getByTestId("assignment-alert-select");
    await expect(
      alertSelect.locator(`option[value="${assignedAlert!.id}"]`),
    ).toHaveCount(1);
    await alertSelect.selectOption(assignedAlert!.id);

    const teamsResponse = await page.request.get("/api/rescue-teams");
    expect(teamsResponse.status()).toBe(200);
    const teamsPayload = (await teamsResponse.json()) as {
      teams: Array<{ email: string; status: "available" | "busy" | "offline" }>;
    };
    const availableTeam = teamsPayload.teams.find((team) => team.status === "available");
    expect(availableTeam).toBeDefined();

    const teamSelect = page.getByTestId("assignment-team-select");
    await expect(
      teamSelect.locator(`option[value="${availableTeam!.email}"]`),
    ).toHaveCount(1);
    await teamSelect.selectOption(availableTeam!.email);
    await page.getByTestId("assignment-submit").click();

    await expect(page.getByText("Mission assigned successfully.")).toBeVisible();
    await logout(page);

    await loginAs(page, "rescueTeam");
    await page.goto("/rescue-team/my-missions");
    await expect(page.getByText(title)).toBeVisible();
  });

  test("Citizen cannot delete alerts created by other roles", async ({ page }) => {
    const title = `Admin-owned ${Date.now()}`;

    await loginAs(page, "admin");
    await createAlertViaForm(
      page,
      title,
      "Administrative alert that citizens do not own.",
      "Central Ops",
    );
    await logout(page);

    await loginAs(page, "citizen");

    const listResponse = await page.request.get("/api/alerts");
    expect(listResponse.status()).toBe(200);
    const listPayload = (await listResponse.json()) as {
      alerts: Array<{ id: string; title: string }>;
    };
    const targetAlert = listPayload.alerts.find((alert) => alert.title === title);
    expect(targetAlert).toBeDefined();

    const deleteResponse = await page.request.delete(`/api/alerts/${targetAlert!.id}`);
    expect(deleteResponse.status()).toBe(403);
  });
});

test.describe("Admin Dashboard Major Flows", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "admin");
  });

  test("Navigation links open admin role pages", async ({ page }) => {
    await page.getByTestId("nav-users").click();
    await expect(page).toHaveURL(/\/admin\/users$/);

    await page.getByTestId("nav-all-alerts").click();
    await expect(page).toHaveURL(/\/admin\/all-alerts$/);
  });

  test("Alert form stays hidden until Add Alert is clicked", async ({ page }) => {
    await expect(page.getByTestId("alert-title")).toHaveCount(0);
    await page.getByTestId("toggle-alert-form").click();
    await expect(page.getByTestId("alert-title")).toBeVisible();
  });

  test("Theme toggle switches mode and persists after reload", async ({ page }) => {
    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveClass(/dark/);

    await page.getByTestId("theme-toggle").click();
    await expect(htmlElement).not.toHaveClass(/dark/);

    await page.reload();
    await expect(htmlElement).not.toHaveClass(/dark/);
  });

  test("Logout returns user to login page", async ({ page }) => {
    await page.getByTestId("logout-button").click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-page")).toBeVisible();
  });

  test("Create alert shows it in the list", async ({ page }) => {
    const title = `Bridge collapse warning ${Date.now()}`;
    const description = "Potential collapse reported by local responders.";
    const location = "Downtown Bridge";

    await createAlertViaForm(page, title, description, location);

    const alertCard = page.getByTestId("alert-item").filter({ hasText: title }).first();
    await expect(alertCard).toBeVisible();
    await expect(alertCard).toContainText("Active");
  });

  test("Alert card renders title, description, and location", async ({ page }) => {
    const title = `Flash flood watch ${Date.now()}`;
    const description = "Water levels rising near residential blocks.";
    const location = "Riverside Sector 9";

    await createAlertViaForm(page, title, description, location);

    const alertCard = page.getByTestId("alert-item").filter({ hasText: title }).first();
    await expect(alertCard).toContainText(description);
    await expect(alertCard).toContainText(location);
  });

  test("Mark as resolved updates status", async ({ page }) => {
    const title = `Power outage emergency ${Date.now()}`;
    const description = "Multiple neighborhoods without power.";
    const location = "North District";

    await createAlertViaForm(page, title, description, location);

    const alertCard = page.getByTestId("alert-item").filter({ hasText: title }).first();
    await alertCard.getByRole("button", { name: "Mark as Resolved" }).click();
    await expect(alertCard).toContainText("Resolved");
  });

  test("Submitting an empty alert form shows validation error", async ({ page }) => {
    await page.getByTestId("toggle-alert-form").click();
    await page.getByTestId("alert-submit").click();
    await expect(page.getByTestId("alert-form-error")).toHaveText(
      "All fields are required.",
    );
  });
});
