import { test, expect } from '@playwright/test';

test.describe('PWA Installation', () => {
  test('should have PWA manifest', async ({ page }) => {
    await page.goto('/');

    // Vérifier que le manifest est présent
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);

    // Vérifier le theme-color
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#5FBDB4');
  });

  test('should have Apple Touch icon', async ({ page }) => {
    await page.goto('/');

    // Vérifier l'icône Apple Touch
    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    await expect(appleTouchIcon).toHaveAttribute(
      'href',
      '/apple-touch-icon.png'
    );
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');

    // Vérifier le titre de la page
    await expect(page).toHaveTitle(/HappyRow/);
  });

  test('should load and display the app', async ({ page }) => {
    await page.goto('/');

    // Attendre que l'app se charge
    await page.waitForLoadState('networkidle');

    // Prendre une capture d'écran
    await page.screenshot({ path: 'tests/e2e/screenshots/home.png' });

    // Vérifier qu'il n'y a pas d'erreurs JavaScript
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });

    // Attendre un peu pour capturer d'éventuelles erreurs
    await page.waitForTimeout(1000);

    expect(errors).toHaveLength(0);
  });

  test('should register service worker', async ({ page }) => {
    await page.goto('/');

    // Attendre que le service worker soit enregistré
    await page.waitForLoadState('networkidle');

    // Vérifier que le service worker est enregistré
    const swRegistration = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration();
    });

    expect(swRegistration).toBeTruthy();
  });

  test('should work offline (basic assets)', async ({ page, context }) => {
    // Première visite pour mettre en cache
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Attendre que le SW soit actif
    await page.waitForTimeout(2000);

    // Simuler le mode offline
    await context.setOffline(true);

    // Recharger la page
    await page.reload();

    // Vérifier que la page se charge depuis le cache
    await expect(page).toHaveTitle(/HappyRow/);

    // Rétablir la connexion
    await context.setOffline(false);
  });
});
