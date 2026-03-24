"use strict";

const { By, Key, until } = require("selenium-webdriver");
const assert = require("assert");
const { createDriver, getBaseUrl } = require("./selenium-utils");

const baseUrl = getBaseUrl().replace(/\/$/, "");

/** Avoid sticky header / viewport intercepts (notably in Firefox). */
async function safeClick(driver, locator) {
  const el = await driver.findElement(locator);
  await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", el);
  await driver.sleep(150);
  await driver.executeScript("arguments[0].click();", el);
}

async function safeClickElement(driver, el) {
  await driver.executeScript("arguments[0].scrollIntoView({block: 'center', inline: 'center'});", el);
  await driver.sleep(100);
  await driver.executeScript("arguments[0].click();", el);
}

function formatPhpLike(n) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP"
  }).format(n);
}

async function TC1(driver) {
  console.log("TC1: navigate to menu page from home");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-menu"] a')).click();
  await driver.wait(until.urlContains("/menu"), 10000);
  console.log("TC1 passed");
}

async function TC2(driver) {
  console.log("TC2: navigate to pos page from home");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);
  console.log("TC2 passed");
}

async function TC3(driver) {
  console.log("TC3: navigate to about section from home");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-about"] a')).click();
  await driver.wait(until.elementLocated(By.css('[data-testid="home-about"]')), 10000);
  console.log("TC3 passed");
}

async function TC4(driver) {
  console.log("TC4: navigate to contact section from home");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-contact"] a')).click();
  await driver.wait(until.elementLocated(By.css('[data-testid="home-contact"]')), 10000);
  console.log("TC4 passed");
}

async function TC5(driver) {
  console.log("TC5: navigate to home from menu via nav");
  await driver.get(`${baseUrl}/menu`);
  await driver.findElement(By.css('[data-testid="nav-link-home"] a')).click();
  await driver.wait(until.elementLocated(By.css('[data-testid="page-home"]')), 10000);
  console.log("TC5 passed");
}

async function TC6(driver) {
  console.log("TC6: navigate to home via brand");
  await driver.get(`${baseUrl}/menu`);
  await driver.findElement(By.css('[data-testid="site-brand-link"]')).click();
  await driver.wait(until.elementLocated(By.css('[data-testid="page-home"]')), 10000);
  console.log("TC6 passed");
}

async function TC7(driver) {
  console.log("TC7: browse menu CTA");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="home-cta-browse-menu"]')).click();
  await driver.wait(until.urlContains("/menu"), 10000);
  console.log("TC7 passed");
}

async function TC8(driver) {
  console.log("TC8: visit us CTA scrolls to contact");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="home-cta-visit-us"]')).click();
  await driver.wait(until.elementLocated(By.css('[data-testid="home-contact"]')), 10000);
  console.log("TC8 passed");
}

async function TC9(driver) {
  console.log("TC9: filter to cold drinks");
  await driver.get(`${baseUrl}/menu`);
  await driver.findElement(By.css('[data-testid="menu-filter-cold-drinks"]')).click();
  const cards = await driver.findElements(By.css('[data-testid^="menu-catalog-item-"]'));
  assert.ok(cards.length > 0, "Expected cold drink menu cards");
  console.log("TC9 passed");
}

async function TC10(driver) {
  console.log("TC10: filter to hot drinks");
  await driver.get(`${baseUrl}/menu`);
  await driver.findElement(By.css('[data-testid="menu-filter-hot-drinks"]')).click();
  const cards = await driver.findElements(By.css('[data-testid^="menu-catalog-item-"]'));
  assert.ok(cards.length > 0, "Expected hot drink menu cards");
  console.log("TC10 passed");
}

async function TC11(driver) {
  console.log("TC11: filter to snacks");
  await driver.get(`${baseUrl}/menu`);
  await driver.findElement(By.css('[data-testid="menu-filter-snacks"]')).click();
  const cards = await driver.findElements(By.css('[data-testid^="menu-catalog-item-"]'));
  assert.ok(cards.length > 0, "Expected snack menu cards");
  console.log("TC11 passed");
}

async function TC12(driver) {
  console.log("TC12: menu search input accepts text");
  await driver.get(`${baseUrl}/menu`);
  const input = await driver.findElement(By.css('[data-testid="menu-search-input"]'));
  await input.sendKeys("Testing for Search");
  const value = await input.getAttribute("value");
  assert.strictEqual(value, "Testing for Search");
  console.log("TC12 passed");
}

async function TC13(driver) {
  console.log("TC13: search finds Cold Coffee");
  await driver.get(`${baseUrl}/menu`);
  const input = await driver.findElement(By.css('[data-testid="menu-search-input"]'));
  await input.sendKeys("Cold Coffee");
  await driver.wait(
    until.elementLocated(By.xpath('//*[contains(@data-testid, "menu-catalog-item-")]//h3[contains(., "Cold Coffee")]')),
    10000
  );
  console.log("TC13 passed");
}

async function TC14(driver) {
  console.log("TC14: search for Raspberry Pie — empty or matching cards");
  await driver.get(`${baseUrl}/menu`);
  const input = await driver.findElement(By.css('[data-testid="menu-search-input"]'));
  await input.sendKeys("Raspberry Pie");
  await driver.sleep(500);
  const empty = await driver.findElements(By.css('[data-testid="menu-empty-state"]'));
  const cards = await driver.findElements(By.css('[data-testid^="menu-catalog-item-"]'));
  assert.ok(empty.length > 0 || cards.length > 0, "Expected empty state or at least one catalog card");
  console.log("TC14 passed");
}

async function TC15(driver) {
  console.log("TC15: cold filter + search Cold Coffee");
  await driver.get(`${baseUrl}/menu`);
  await driver.findElement(By.css('[data-testid="menu-filter-cold-drinks"]')).click();
  const input = await driver.findElement(By.css('[data-testid="menu-search-input"]'));
  await input.sendKeys("Cold Coffee");
  await driver.wait(
    until.elementLocated(By.xpath('//*[contains(@data-testid, "menu-catalog-item-")]//h3[contains(., "Cold Coffee")]')),
    10000
  );
  console.log("TC15 passed");
}

async function TC16(driver) {
  console.log("TC16: hot filter + search Cappuccino");
  await driver.get(`${baseUrl}/menu`);
  await driver.findElement(By.css('[data-testid="menu-filter-hot-drinks"]')).click();
  const input = await driver.findElement(By.css('[data-testid="menu-search-input"]'));
  await input.sendKeys("Cappuccino");
  await driver.wait(
    until.elementLocated(By.xpath('//*[contains(@data-testid, "menu-catalog-item-")]//h3[contains(., "Cappuccino")]')),
    10000
  );
  console.log("TC16 passed");
}

async function TC17(driver) {
  console.log("TC17: snacks filter + search Sandwich Ham");
  await driver.get(`${baseUrl}/menu`);
  await driver.findElement(By.css('[data-testid="menu-filter-snacks"]')).click();
  const input = await driver.findElement(By.css('[data-testid="menu-search-input"]'));
  await input.sendKeys("Sandwich Ham");
  await driver.wait(
    until.elementLocated(
      By.xpath('//*[contains(@data-testid, "menu-catalog-item-")]//h3[contains(., "Sandwich Ham")]')
    ),
    10000
  );
  console.log("TC17 passed");
}

async function TC18(driver) {
  console.log("TC18: cold filter + nonsense search shows empty or no cold coffee");
  await driver.get(`${baseUrl}/menu`);
  await driver.findElement(By.css('[data-testid="menu-filter-cold-drinks"]')).click();
  const input = await driver.findElement(By.css('[data-testid="menu-search-input"]'));
  await input.sendKeys("NOT cold coffee");
  await driver.sleep(500);
  const titles = await driver.findElements(By.css('[data-testid^="menu-catalog-item-"] h3'));
  const names = [];
  for (const t of titles) {
    names.push(await t.getText());
  }
  const hasColdCoffee = names.some((n) => n.includes("Cold Coffee"));
  assert.ok(!hasColdCoffee, "Did not expect Cold Coffee for nonsense query");
  console.log("TC18 passed");
}

async function TC19(driver) {
  console.log("TC19: hot filter + nonsense search");
  await driver.get(`${baseUrl}/menu`);
  await driver.findElement(By.css('[data-testid="menu-filter-hot-drinks"]')).click();
  const input = await driver.findElement(By.css('[data-testid="menu-search-input"]'));
  await input.sendKeys("NOT hot coffee");
  await driver.sleep(500);
  const titles = await driver.findElements(By.css('[data-testid^="menu-catalog-item-"] h3'));
  const names = [];
  for (const t of titles) {
    names.push(await t.getText());
  }
  const hasCappuccino = names.some((n) => n.includes("Cappuccino"));
  assert.ok(!hasCappuccino, "Did not expect typical hot drinks for nonsense query");
  console.log("TC19 passed");
}

async function TC20(driver) {
  console.log("TC20: snacks filter + nonsense search");
  await driver.get(`${baseUrl}/menu`);
  await driver.findElement(By.css('[data-testid="menu-filter-snacks"]')).click();
  const input = await driver.findElement(By.css('[data-testid="menu-search-input"]'));
  await input.sendKeys("NOT a snack");
  await driver.sleep(500);
  const empty = await driver.findElements(By.css('[data-testid="menu-empty-state"]'));
  assert.ok(empty.length > 0, "Expected empty state for nonsense snack search");
  console.log("TC20 passed");
}

async function TC21(driver) {
  console.log("TC21: Menu — filter Snacks then All shows items");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-menu"] a')).click();
  await driver.wait(until.urlContains("/menu"), 10000);

  await driver.findElement(By.css('[data-testid="menu-filter-snacks"]')).click();
  await driver.findElement(By.css('[data-testid="menu-filter-all"]')).click();

  const menuItems = await driver.findElements(By.css('[data-testid^="menu-catalog-item-"]'));
  assert.ok(menuItems.length > 0, "No menu items when filtering to All");
  console.log("TC21 passed");
}

async function TC22(driver) {
  console.log("TC22: POS — cold drinks filter shows cold drink cards");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await driver.findElement(By.css('[data-testid="pos-filter-cold-drinks"]')).click();
  const coldDrinkItems = await driver.findElements(
    By.xpath('//button[contains(@class, "pos-item-card") and contains(., "Cold Drinks")]')
  );
  assert.ok(coldDrinkItems.length > 0, "No cold drink POS items");
  console.log("TC22 passed");
}

async function TC23(driver) {
  console.log("TC23: POS — hot drinks filter");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await driver.findElement(By.css('[data-testid="pos-filter-hot-drinks"]')).click();
  const items = await driver.findElements(
    By.xpath('//button[contains(@class, "pos-item-card") and contains(., "Hot Drinks")]')
  );
  assert.ok(items.length > 0, "No hot drink POS items");
  console.log("TC23 passed");
}

async function TC24(driver) {
  console.log("TC24: POS — snacks filter");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await driver.findElement(By.css('[data-testid="pos-filter-snacks"]')).click();
  const items = await driver.findElements(
    By.xpath('//button[contains(@class, "pos-item-card") and contains(., "Snacks")]')
  );
  assert.ok(items.length > 0, "No snack POS items");
  console.log("TC24 passed");
}

async function TC25(driver) {
  console.log("TC25: Order History navigation");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await driver.findElement(By.css('[data-testid="pos-link-order-history"]')).click();
  await driver.wait(until.urlContains("/pos/history"), 10000);
  assert.strictEqual(await driver.getCurrentUrl(), `${baseUrl}/pos/history`);
  console.log("TC25 passed");
}

async function TC26(driver) {
  console.log("TC26: Add Cold Coffee to order");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await safeClick(driver, By.css('[data-testid="pos-add-item-It015"]'));

  const orderSummary = await driver.findElement(By.css('[data-testid="pos-order-panel"]'));
  const orderItems = await orderSummary.findElements(By.xpath('.//strong[contains(text(), "Cold Coffee")]'));
  assert.ok(orderItems.length > 0, "Cold Coffee not in order summary");
  console.log("TC26 passed");
}

async function TC27(driver) {
  console.log("TC27: Remove item from order");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await safeClick(driver, By.css('[data-testid="pos-add-item-It015"]'));

  await safeClick(driver, By.css('[data-testid="pos-cart-decrease-It015"]'));

  const orderSummary = await driver.findElement(By.css('[data-testid="pos-order-panel"]'));
  const items = await orderSummary.findElements(By.xpath('.//strong[contains(text(), "Cold Coffee")]'));
  assert.strictEqual(items.length, 0, "Cold Coffee should be removed");
  console.log("TC27 passed");
}

async function TC28(driver) {
  console.log("TC28: Double click increases qty");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const addBtn = await driver.findElement(By.css('[data-testid="pos-add-item-It015"]'));
  await safeClickElement(driver, addBtn);
  await safeClickElement(driver, addBtn);

  const orderSummary = await driver.findElement(By.css('[data-testid="pos-order-panel"]'));
  const qtyEl = await orderSummary.findElement(By.css('[data-testid="pos-cart-qty-It015"]'));
  assert.strictEqual(await qtyEl.getText(), "2");
  console.log("TC28 passed");
}

async function TC29(driver) {
  console.log("TC29: Grand total for two items");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await safeClick(driver, By.css('[data-testid="pos-add-item-It015"]'));
  await safeClick(driver, By.css('[data-testid="pos-add-item-It011"]'));

  const orderSummary = await driver.findElement(By.css('[data-testid="pos-order-panel"]'));
  const grand = await orderSummary.findElement(By.css('[data-testid="pos-summary-grand-total"]'));
  const text = await grand.getText();
  assert.ok(text.includes("₱580.35"), `Expected ₱580.35 in total, got ${text}`);
  console.log("TC29 passed");
}

async function TC30(driver) {
  console.log("TC30: Grand total updates when adding/removing");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await safeClick(driver, By.css('[data-testid="pos-add-item-It015"]'));
  await safeClick(driver, By.css('[data-testid="pos-add-item-It024"]'));

  let orderSummary = await driver.findElement(By.css('[data-testid="pos-order-panel"]'));
  let grand = await orderSummary.findElement(By.css('[data-testid="pos-summary-grand-total"]'));
  let text = await grand.getText();
  assert.ok(text.includes("₱653.35"), `Expected ₱653.35 after add, got ${text}`);

  await safeClick(driver, By.css('[data-testid="pos-cart-decrease-It015"]'));
  await driver.sleep(300);

  orderSummary = await driver.findElement(By.css('[data-testid="pos-order-panel"]'));
  grand = await orderSummary.findElement(By.css('[data-testid="pos-summary-grand-total"]'));
  text = await grand.getText();
  assert.ok(text.includes("₱401.50"), `Expected ₱401.50 after remove, got ${text}`);
  console.log("TC30 passed");
}

async function TC31(driver) {
  console.log("TC31: Order type Takeaway");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await driver.findElement(By.css('[data-testid="pos-order-type-takeaway"]')).click();

  const orderSummary = await driver.findElement(By.css('[data-testid="pos-order-panel"]'));
  const typeRow = await orderSummary.findElement(By.css('[data-testid="pos-summary-order-type"]'));
  const typeText = await typeRow.getText();
  assert.ok(typeText.includes("Takeaway"), typeText);
  console.log("TC31 passed");
}

async function TC32(driver) {
  console.log("TC32: Order type back to Dine In");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await driver.findElement(By.css('[data-testid="pos-order-type-takeaway"]')).click();
  await driver.sleep(300);
  await driver.findElement(By.css('[data-testid="pos-order-type-dine-in"]')).click();

  const orderSummary = await driver.findElement(By.css('[data-testid="pos-order-panel"]'));
  const typeRow = await orderSummary.findElement(By.css('[data-testid="pos-summary-order-type"]'));
  const typeText = await typeRow.getText();
  assert.ok(typeText.includes("Dine In"), typeText);
  console.log("TC32 passed");
}

async function TC33(driver) {
  console.log("TC33: Empty customer shows Guest");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const nameInput = await driver.findElement(By.css('[data-testid="pos-customer-input"]'));
  await nameInput.sendKeys("Karl_Test_123");
  await nameInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);

  const summary = await driver.findElement(By.css('[data-testid="pos-summary-customer"]'));
  const text = await summary.getText();
  assert.ok(text.includes("Guest"), text);
  console.log("TC33 passed");
}

async function TC34(driver) {
  console.log("TC34: Customer name on receipt");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const nameInput = await driver.findElement(By.css('[data-testid="pos-customer-input"]'));
  await nameInput.sendKeys("Karl_Test_123");

  const summary = await driver.findElement(By.css('[data-testid="pos-summary-customer"]'));
  const spans = await summary.findElements(By.css("span"));
  const valueSpan = spans[spans.length - 1];
  const guestText = await valueSpan.getText();
  assert.strictEqual(guestText, "Karl_Test_123");
  console.log("TC34 passed");
}

async function TC35(driver) {
  console.log("TC35: Cart panel scrolls when many lines");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const buttons = await driver.findElements(By.css('[data-testid^="pos-add-item-"]'));
  assert.ok(buttons.length > 0, "No POS items");
  for (let i = 0; i < Math.min(15, buttons.length); i++) {
    await safeClickElement(driver, buttons[i]);
    await driver.sleep(50);
  }

  const scrollable = await driver.executeScript(`
    const el = document.querySelector('[data-testid="pos-cart-lines"]');
    if (!el) return false;
    return el.scrollHeight > el.clientHeight;
  `);
  assert.ok(scrollable, "Expected cart lines region to become scrollable");
  console.log("TC35 passed");
}

async function TC36(driver) {
  console.log("TC36: POS search filters grid");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const searchInput = await driver.findElement(By.css('[data-testid="pos-search-input"]'));
  await searchInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
  await searchInput.sendKeys("Coffee");
  await driver.sleep(500);

  const grid = await driver.findElement(By.css('[data-testid="pos-item-grid"]'));
  const strongs = await grid.findElements(By.css("strong"));
  let foundMatch = false;
  for (const s of strongs) {
    const t = (await s.getText()).toLowerCase();
    if (t.includes("coffee")) {
      foundMatch = true;
      break;
    }
  }
  assert.ok(foundMatch, "Expected Coffee match in POS grid");

  await searchInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
  await searchInput.sendKeys("xyz_invalid_item_123");
  await driver.sleep(500);

  const emptyOrNone = await driver.findElements(By.xpath('//*[@data-testid="pos-item-grid"]//button'));
  assert.strictEqual(emptyOrNone.length, 0, "Expected no POS cards for nonsense search");
  console.log("TC36 passed");
}

async function TC37(driver) {
  console.log("TC37: Charge disabled on empty cart");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const chargeBtn = await driver.findElement(By.css('[data-testid="pos-charge-button"]'));
  const disabled = await chargeBtn.getAttribute("disabled");
  assert.ok(disabled !== null, "Charge should be disabled with empty cart");
  console.log("TC37 passed");
}

async function TC38(driver) {
  console.log("TC38: Total formatted to 2 decimal places");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const addBtn = await driver.findElement(By.css('[data-testid="pos-add-item-It015"]'));
  for (let i = 0; i < 3; i++) {
    await safeClickElement(driver, addBtn);
    await driver.sleep(100);
  }

  const totalEl = await driver.findElement(By.css('[data-testid="pos-summary-grand-total"]'));
  const totalText = await totalEl.getText();
  const m = totalText.match(/₱([\d,]+\.\d+)/);
  assert.ok(m, `No currency in total: ${totalText}`);
  const decimals = m[1].split(".")[1];
  assert.ok(decimals && decimals.length <= 2, `Too many decimal places: ${totalText}`);
  console.log("TC38 passed");
}

async function TC39(driver) {
  if (!process.env.DATABASE_URL) {
    console.log("TC39 skipped: set DATABASE_URL to run order save + history check");
    return;
  }
  console.log("TC39: Charge saves order — visible in history");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const nameInput = await driver.findElement(By.css('[data-testid="pos-customer-input"]'));
  const uniqueCustomer = `Karl_Save_Test_${Date.now()}`;
  await nameInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
  await nameInput.sendKeys(uniqueCustomer);

  await driver.wait(until.elementLocated(By.css('[data-testid="pos-item-grid"]')), 10000);
  const menuItems = await driver.findElements(By.css("button.pos-item-card"));
  assert.ok(menuItems.length > 0, "No menu items");
  await driver.executeScript("arguments[0].click();", menuItems[0]);

  await driver.wait(until.elementLocated(By.css('[data-testid="pos-cart-lines"] article')), 10000);

  const chargeBtn = await driver.findElement(By.css('[data-testid="pos-charge-button"]'));
  await driver.executeScript("arguments[0].click();", chargeBtn);

  await driver.wait(until.elementLocated(By.css('[data-testid="pos-status-message"]')), 15000);

  await driver.findElement(By.css('[data-testid="pos-link-order-history"]')).click();
  await driver.wait(until.urlContains("/pos/history"), 10000);
  await driver.sleep(1000);

  const bodyText = await driver.findElement(By.tagName("body")).getText();
  assert.ok(bodyText.includes(uniqueCustomer), `Customer ${uniqueCustomer} not in history`);
  console.log("TC39 passed");
}

async function TC40(driver) {
  console.log("TC40: Clear resets cart and customer");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const nameInput = await driver.findElement(By.css('[data-testid="pos-customer-input"]'));
  await nameInput.sendKeys("Test User");

  await driver.wait(until.elementLocated(By.css('[data-testid="pos-item-grid"]')), 10000);
  const firstItem = await driver.findElement(By.css("button.pos-item-card"));
  await driver.executeScript("arguments[0].click();", firstItem);

  await driver.findElement(By.css('[data-testid="pos-clear-order"]')).click();
  await driver.sleep(500);

  const nameVal = await nameInput.getAttribute("value");
  assert.strictEqual(nameVal, "");

  await driver.wait(until.elementLocated(By.css('[data-testid="pos-cart-empty"]')), 5000);
  console.log("TC40 passed");
}

async function TC41(driver) {
  if (!process.env.DATABASE_URL) {
    console.log("TC41 skipped: DATABASE_URL required");
    return;
  }
  console.log("TC41: Charge then Clear — order still persisted");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const uniqueCustomer = `TC41_${Date.now()}`;
  const nameInput = await driver.findElement(By.css('[data-testid="pos-customer-input"]'));
  await nameInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
  await nameInput.sendKeys(uniqueCustomer);

  await safeClick(driver, By.css('[data-testid="pos-add-item-It015"]'));

  await driver.wait(until.elementLocated(By.css('[data-testid="pos-cart-lines"] article')), 5000);

  const chargeBtn = await driver.findElement(By.css('[data-testid="pos-charge-button"]'));
  await driver.executeScript("arguments[0].click();", chargeBtn);
  await driver.wait(until.elementLocated(By.css('[data-testid="pos-status-message"]')), 15000);
  const status = await driver.findElement(By.css('[data-testid="pos-status-message"]')).getText();
  assert.ok(status.includes("saved") || status.includes("Order"), `Unexpected status: ${status}`);

  await driver.findElement(By.css('[data-testid="pos-clear-order"]')).click();
  await driver.sleep(400);
  await driver.wait(until.elementLocated(By.css('[data-testid="pos-cart-empty"]')), 5000);

  await driver.findElement(By.css('[data-testid="pos-link-order-history"]')).click();
  await driver.wait(until.urlContains("/pos/history"), 10000);
  await driver.sleep(1000);

  const bodyText = await driver.findElement(By.tagName("body")).getText();
  assert.ok(bodyText.includes(uniqueCustomer), `Order for ${uniqueCustomer} not found after Clear`);
  console.log("TC41 passed");
}

async function TC42(driver) {
  if (!process.env.DATABASE_URL) {
    console.log("TC42 skipped: DATABASE_URL required");
    return;
  }
  console.log("TC42: Session clears after successful Charge");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await safeClick(driver, By.css('[data-testid="pos-add-item-It015"]'));
  await driver.wait(until.elementLocated(By.css('[data-testid="pos-cart-lines"] article')), 5000);

  const chargeBtn = await driver.findElement(By.css('[data-testid="pos-charge-button"]'));
  await driver.executeScript("arguments[0].click();", chargeBtn);
  await driver.wait(until.elementLocated(By.css('[data-testid="pos-status-message"]')), 15000);

  await driver.wait(until.elementLocated(By.css('[data-testid="pos-cart-empty"]')), 5000);
  const nameInput = await driver.findElement(By.css('[data-testid="pos-customer-input"]'));
  assert.strictEqual(await nameInput.getAttribute("value"), "");

  const empty = await driver.findElements(By.css('[data-testid="pos-cart-empty"]'));
  assert.ok(empty.length > 0, "Cart should show empty after charge");
  console.log("TC42 passed");
}

async function TC43(driver) {
  console.log("TC43: Total resets on Clear");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await safeClick(driver, By.css('[data-testid="pos-add-item-It015"]'));
  await driver.wait(until.elementLocated(By.css('[data-testid="pos-summary-grand-total"]')), 5000);

  let grand = await driver.findElement(By.css('[data-testid="pos-summary-grand-total"]'));
  let text = await grand.getText();
  assert.ok(/₱[\d,]+/.test(text) && !/₱0\.00/.test(text), `Expected non-zero total before clear: ${text}`);

  await driver.findElement(By.css('[data-testid="pos-clear-order"]')).click();
  await driver.sleep(400);

  grand = await driver.findElement(By.css('[data-testid="pos-summary-grand-total"]'));
  text = await grand.getText();
  assert.ok(
    text.includes("₱0.00") || /₱0(?:\.00)?/.test(text),
    `Expected zero total after clear, got: ${text}`
  );
  console.log("TC43 passed");
}

async function TC44(driver) {
  if (!process.env.DATABASE_URL) {
    console.log("TC44 skipped: DATABASE_URL required");
    return;
  }
  console.log("TC44: Order History — date shown on saved order");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await safeClick(driver, By.css('[data-testid="pos-add-item-It011"]'));
  await driver.wait(until.elementLocated(By.css('[data-testid="pos-cart-lines"] article')), 5000);

  const chargeBtn = await driver.findElement(By.css('[data-testid="pos-charge-button"]'));
  await driver.executeScript("arguments[0].click();", chargeBtn);
  await driver.wait(until.elementLocated(By.css('[data-testid="pos-status-message"]')), 15000);

  await driver.findElement(By.css('[data-testid="pos-link-order-history"]')).click();
  await driver.wait(until.urlContains("/pos/history"), 10000);
  await driver.sleep(1500);

  await driver.wait(until.elementLocated(By.css('[data-testid="order-history-list"]')), 15000);
  const dateEl = await driver.findElement(By.css('[data-testid^="order-history-date-"]'));
  const dateText = await dateEl.getText();
  assert.ok(dateText.trim().length > 0, "Expected non-empty order date");
  assert.ok(/\d{4}|\/\d{2}\/|\d{1,2}:/.test(dateText), `Expected date-like text, got: ${dateText}`);
  console.log("TC44 passed");
}

async function TC45(driver) {
  console.log("TC45: POS special characters in customer name");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const special = `O'Brien <>&!@#$%^&*()`;
  const nameInput = await driver.findElement(By.css('[data-testid="pos-customer-input"]'));
  await nameInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
  await nameInput.sendKeys(special);

  await driver.sleep(300);
  const terminal = await driver.findElement(By.css('[data-testid="pos-terminal"]'));
  assert.ok(await terminal.isDisplayed(), "POS terminal should remain visible");

  assert.strictEqual(await nameInput.getAttribute("value"), special);
  const summary = await driver.findElement(By.css('[data-testid="pos-summary-customer"]'));
  const shown = await summary.getText();
  assert.ok(shown.includes("O'Brien"), `Customer summary should reflect name: ${shown}`);
  console.log("TC45 passed");
}

async function TC46(driver) {
  console.log("TC46: Large quantity grand total");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await safeClick(driver, By.css('[data-testid="pos-add-item-It015"]'));
  const incBtn = await driver.findElement(By.css('[data-testid="pos-cart-increase-It015"]'));
  for (let i = 0; i < 34; i++) {
    await safeClickElement(driver, incBtn);
    await driver.sleep(30);
  }

  const grand = await driver.findElement(By.css('[data-testid="pos-summary-grand-total"]'));
  const text = await grand.getText();
  const qty = 35;
  const rate = Number(process.env.GBP_TO_PHP_RATE);
  const gbpToPhp = Number.isFinite(rate) && rate > 0 ? rate : 73;
  const unitPhp = 3.45 * gbpToPhp;
  const expected = Math.round(qty * unitPhp * 100) / 100;
  const formatted = formatPhpLike(expected);
  const compact = (s) => s.replace(/\s/g, "").replace(/\u00a0/g, "");
  assert.ok(
    compact(text).includes(compact(formatted)),
    `Expected total ${formatted} for qty ${qty}, got ${text}`
  );
  console.log("TC46 passed");
}

async function TC47(driver) {
  console.log("TC47: Navigation backwards consistency");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-menu"] a')).click();
  await driver.wait(until.urlContains("/menu"), 10000);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);
  await driver.findElement(By.css('[data-testid="nav-link-home"] a')).click();
  await driver.wait(until.elementLocated(By.css('[data-testid="page-home"]')), 10000);

  let url = await driver.getCurrentUrl();
  assert.ok(url.replace(/\/$/, "").endsWith(baseUrl.replace(/\/$/, "")), url);

  await driver.findElement(By.css('[data-testid="nav-link-menu"] a')).click();
  await driver.wait(until.urlContains("/menu"), 10000);
  await driver.wait(until.elementLocated(By.css('[data-testid="page-menu"]')), 5000);
  url = await driver.getCurrentUrl();
  assert.ok(url.includes("/menu"), url);
  console.log("TC47 passed");
}

async function TC48(driver) {
  console.log("TC48: Menu search special symbols — empty state, no crash");
  await driver.get(`${baseUrl}/menu`);
  await driver.wait(until.elementLocated(By.css('[data-testid="menu-search-input"]')), 10000);

  const input = await driver.findElement(By.css('[data-testid="menu-search-input"]'));
  await input.sendKeys(Key.chord(Key.CONTROL, "a"), Key.BACK_SPACE);
  await input.sendKeys("!@#$");
  await driver.sleep(600);

  const main = await driver.findElement(By.css('[data-testid="page-menu"]'));
  assert.ok(await main.isDisplayed(), "Menu page should still render");

  const empty = await driver.findElements(By.css('[data-testid="menu-empty-state"]'));
  const cards = await driver.findElements(By.css('[data-testid^="menu-catalog-item-"]'));
  assert.ok(empty.length > 0 || cards.length === 0, "Expected empty catalog or empty state for symbol search");
  console.log("TC48 passed");
}

async function TC49(driver) {
  console.log("TC49: Category filter stays active after adding item");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  const coldChip = await driver.findElement(By.css('[data-testid="pos-filter-cold-drinks"]'));
  await safeClickElement(driver, coldChip);
  await driver.sleep(200);

  await safeClick(driver, By.css('[data-testid="pos-add-item-It015"]'));
  await driver.wait(until.elementLocated(By.css('[data-testid="pos-cart-lines"] article')), 5000);

  const coldChipAfter = await driver.findElement(By.css('[data-testid="pos-filter-cold-drinks"]'));
  const cls = await coldChipAfter.getAttribute("class");
  assert.ok(cls && cls.includes("active"), `Cold Drinks chip should stay active, class="${cls}"`);

  const allChip = await driver.findElement(By.css('[data-testid="pos-filter-all"]'));
  const allCls = await allChip.getAttribute("class");
  assert.ok(!allCls.includes("active"), "All should not be active");
  console.log("TC49 passed");
}

async function TC50(driver) {
  console.log("TC50: Dine-in / Takeaway switch does not clear cart");
  await driver.get(`${baseUrl}/`);
  await driver.findElement(By.css('[data-testid="nav-link-pos"] a')).click();
  await driver.wait(until.urlContains("/pos"), 10000);

  await safeClick(driver, By.css('[data-testid="pos-add-item-It015"]'));
  await driver.wait(until.elementLocated(By.css('[data-testid="pos-cart-lines"] article')), 5000);

  await driver.findElement(By.css('[data-testid="pos-order-type-takeaway"]')).click();
  await driver.sleep(200);
  let lines = await driver.findElements(By.css('[data-testid="pos-cart-lines"] article'));
  assert.ok(lines.length > 0, "Cart should still have lines after Takeaway");

  await driver.findElement(By.css('[data-testid="pos-order-type-dine-in"]')).click();
  await driver.sleep(200);
  lines = await driver.findElements(By.css('[data-testid="pos-cart-lines"] article'));
  assert.ok(lines.length > 0, "Cart should still have lines after Dine In");

  const coldName = await driver.findElement(By.xpath('//*[@data-testid="pos-cart-line-It015"]//strong')).getText();
  assert.ok(coldName.includes("Cold Coffee"), coldName);
  console.log("TC50 passed");
}

const suite = [
  TC1,
  TC2,
  TC3,
  TC4,
  TC5,
  TC6,
  TC7,
  TC8,
  TC9,
  TC10,
  TC11,
  TC12,
  TC13,
  TC14,
  TC15,
  TC16,
  TC17,
  TC18,
  TC19,
  TC20,
  TC21,
  TC22,
  TC23,
  TC24,
  TC25,
  TC26,
  TC27,
  TC28,
  TC29,
  TC30,
  TC31,
  TC32,
  TC33,
  TC34,
  TC35,
  TC36,
  TC37,
  TC38,
  TC39,
  TC40,
  TC41,
  TC42,
  TC43,
  TC44,
  TC45,
  TC46,
  TC47,
  TC48,
  TC49,
  TC50
];

async function runAllTests() {
  const browser = process.env.BROWSER || "chrome";
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Browser: ${browser}`);

  let driver;
  try {
    driver = await createDriver();
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }

  try {
    for (let i = 0; i < suite.length; i++) {
      const fn = suite[i];
      const n = i + 1;
      try {
        await fn(driver);
        console.log(`--- TC${n} completed ---\n`);
      } catch (err) {
        console.error(`TC${n} FAILED:`, err);
        throw err;
      }
    }
    console.log("All tests completed successfully.");
  } finally {
    await driver.quit();
  }
}

runAllTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
