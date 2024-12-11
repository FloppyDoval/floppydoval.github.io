import { test, expect } from '@playwright/test';

test.describe('HomePage Component', () => {
  // Before each test, navigate to the homepage
  test.beforeEach(async ({ page }) => {
    // Navigate to the page where the component is rendered
    await page.goto('http://localhost:8000');  // Update this URL if needed
  });

  // Test if the page renders the main components correctly
  test('should render the homepage with necessary elements', async ({ page }) => {
    // Verify that the logo is rendered
    const logo = await page.getByLabel("Platform logo");
    await expect(logo).toBeVisible();

    // Verify that the flags are rendered correctly
    const koreanFlag = await page.getByLabel("Korean flag");
    const japaneseFlag = await page.getByLabel("Japanese flag");;
    const mongolianFlag = await page.getByLabel("Mongolian flag");;
    const chineseFlag = await page.getByLabel("Chinese flag");;
    await expect(koreanFlag).toBeVisible();
    await expect(japaneseFlag).toBeVisible();
    await expect(mongolianFlag).toBeVisible();
    await expect(chineseFlag).toBeVisible();

    // Verify the title and slogan
    const title = await page.getByLabel("Welcome to LanguageGo!");
    const slogan = await page.getByLabel("Platform Slogan");
    await expect(title).toBeVisible();
    await expect(slogan).toBeVisible();

    // Verify that the description paragraph is rendered
    const description = await page.getByLabel("Platform description");
    await expect(description).toBeVisible();

    // Verify if the video is rendered correctly
    const video = await page.getByLabel("Demo Video");
    await expect(video).toBeVisible();

    // Verify the Sign In button is visible
    const signInButton = await page.getByLabel("Sign In Button");
    await expect(signInButton).toBeVisible();

    // Verify the Learning Mode button is visible
    const learnButton = await page.getByLabel("Learning Mode Button");
    await expect(learnButton).toBeVisible();
  });

  // Test if the "Learning Mode" button navigates to the correct page
  test('should navigate to learning page when Learning Mode button is clicked', async ({ page }) => {
    const learnButton = await page.getByLabel("Learning Mode Button");
    await learnButton.click();

    // Verify if the page navigates to the learning page
    await expect(page).toHaveURL('http://localhost:8000/learnPage');
  });
});