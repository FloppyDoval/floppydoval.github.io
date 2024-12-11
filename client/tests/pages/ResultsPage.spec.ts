import { test, expect } from '@playwright/test';

test.describe('ResultsPage Component', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the page where the component is rendered
        await page.goto('http://localhost:8000');  // Update this URL if needed
    });

    test('all functionality', async ({ page }) => {
        await page.getByLabel('Learning Mode Button').click();

        await expect(page.locator('div').filter({ hasText: /^Time: 0:00$/ })).toBeVisible();

        // Loop to process cards until no more prompts are available
        while (await page.locator('text=Press:').isVisible()) {
            const locator = page.locator('text=Press:');
            if (await locator.isVisible()) {
                const promptText = await locator.innerText();

                // Extract the key or key combination from the text
                const keyMatch = promptText.match(/^Press: (Shift \+ )?(\w)$/);
                if (!keyMatch) {
                    throw new Error('Unexpected key prompt format');
                }

                const [_, hasShift, key] = keyMatch; // Extract Shift presence and the key

                // Press the appropriate key(s)
                if (hasShift) {
                    await page.keyboard.press(`Shift+${key.toUpperCase()}`);
                } else {
                    await page.keyboard.press(key.toLowerCase());
                }
            } else {
                break; // Exit loop if prompt is no longer visible
            }

            // Add a short delay to prevent aggressive polling
            await page.waitForTimeout(300);
        }

        // Validate the results page using ARIA labels
        await expect(page.getByLabel('Total')).toBeVisible();
        await expect(page.getByLabel('Incorrect')).toBeVisible();
        await expect(page.getByLabel('Accuracy')).toBeVisible();
        await expect(page.getByLabel('Time Spent')).toBeVisible();

        // Extract values and ensure the element is found before accessing innerText
        const totalAttemptsElement = await page.locator('[aria-label="Total"]');
        const correctAttemptsElement = await page.locator('[aria-label="Correct"]');
        const incorrectAttemptsElement = await page.locator('[aria-label="Incorrect"]');
        const accuracyElement = await page.locator('[aria-label="Accuracy"]');
        const timeSpentElement = await page.locator('[aria-label="Time Spent"]');

        // Extract their text if elements are present
        const totalAttemptsText = await totalAttemptsElement.isVisible() ? await totalAttemptsElement.innerText() : '';
        const correctAttemptsText = await correctAttemptsElement.isVisible() ? await correctAttemptsElement.innerText() : '';
        const incorrectAttemptsText = await incorrectAttemptsElement.isVisible() ? await incorrectAttemptsElement.innerText() : '';
        const accuracyText = await accuracyElement.isVisible() ? await accuracyElement.innerText() : '';
        const timeSpentText = await timeSpentElement.isVisible() ? await timeSpentElement.innerText() : '';

        // Check if text is non-null and parse numeric values
        if (totalAttemptsText && correctAttemptsText && incorrectAttemptsText && accuracyText) {
            const totalAttempts = parseInt(totalAttemptsText.match(/\d+/)?.[0] || '0', 10);
            const correctAttempts = parseInt(correctAttemptsText.match(/\d+/)?.[0] || '0', 10);
            const incorrectAttempts = parseInt(incorrectAttemptsText.match(/\d+/)?.[0] || '0', 10);
            const accuracy = parseFloat(accuracyText.match(/[\d.]+/)?.[0] || '0');

            // Check total attempts > 0
            expect(totalAttempts).toBeGreaterThan(0);

            // Check correct + incorrect equals total
            expect(correctAttempts + incorrectAttempts).toBe(totalAttempts);

            // Check accuracy >= 0
            expect(accuracy).toBeGreaterThanOrEqual(0);
        } else {
            throw new Error('One or more elements are missing or have invalid text.');
        }

        // Parse the time spent
        const timeMatch = timeSpentText.match(/Time Spent: (\d+)m (\d+)s/);
        if (!timeMatch) {
            throw new Error('Time Spent text format does not match expected pattern');
        }

        const minutes = parseInt(timeMatch[1], 10);
        const seconds = parseInt(timeMatch[2], 10);

        // Convert to total seconds and assert it's greater than or equal to 0
        const totalSeconds = minutes * 60 + seconds;
        expect(totalSeconds).toBeGreaterThanOrEqual(0); // Ensure time is valid

        // Interact with ResultsPage elements
        await page.getByRole('button', { name: 'Try Again' }).click();
        await expect(page.locator('div').filter({ hasText: /^Time: 0:00$/ })).toBeVisible();
    });
});
