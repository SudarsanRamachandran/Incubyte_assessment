const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

// Page Object Model Classes
class SignupPage {
    constructor(driver) {
        this.driver = driver;
    }

    async open() {
        await this.driver.get('https://magento.softwaretestingboard.com/customer/account/create/');
    }

    async fillSignupForm(firstName, lastName, email, password) {
        await this.driver.findElement(By.id('firstname')).sendKeys(firstName);
        await this.driver.findElement(By.id('lastname')).sendKeys(lastName);
        await this.driver.findElement(By.id('email_address')).sendKeys(email);
        await this.driver.findElement(By.id('password')).sendKeys(password);
        await this.driver.findElement(By.id('password-confirmation')).sendKeys(password);
    }

    async submitForm() {
        await this.driver.findElement(By.css('button[title="Create an Account"]')).click();
    }
}

class AccountPage {
    constructor(driver) {
        this.driver = driver;
    }

    async signOut() {
        console.log("Attempting to sign out...");
    
        // Click on the dropdown menu
        const dropdown = await this.driver.wait(
            until.elementLocated(By.css('.customer-welcome .customer-name')),
            10000
        );
        await dropdown.click();
        console.log("Dropdown menu opened.");
    
        // Click the "Sign Out" link
        const signOutLink = await this.driver.wait(
            until.elementLocated(By.linkText('Sign Out')),
            10000
        );
        await signOutLink.click();
        console.log("Sign out link clicked.");
    
        // Wait for the 5-second delay and redirect
        await new Promise((resolve) => setTimeout(resolve, 5000));
    
        // Wait for the homepage to load
        await this.driver.wait(async () => {
            const currentUrl = await this.driver.getCurrentUrl();
            return currentUrl === 'https://magento.softwaretestingboard.com/';
        }, 10000);
        console.log("Sign out completed and redirected to homepage.");
    }
    
}

class LoginPage {
    constructor(driver) {
        this.driver = driver;
    }

    async open() {
        await this.driver.get('https://magento.softwaretestingboard.com/customer/account/login/');
    }

    async login(email, password) {
        await this.driver.wait(until.elementLocated(By.id('email')), 10000).sendKeys(email);
        await this.driver.wait(until.elementLocated(By.id('pass')), 10000).sendKeys(password);
        await this.driver.findElement(By.id('send2')).click();
    }
}

(async function testSignupSignoutSignin() {
    const driver = new Builder().forBrowser('chrome').build();

    // Maximise the browser window
    await driver.manage().window().maximize();


    const firstName = 'Test';
    const lastName = 'User';
    const fullName = `${firstName} ${lastName}`;
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'Password123';

    try {
        // Signup
        const signupPage = new SignupPage(driver);
        await signupPage.open();
        await signupPage.fillSignupForm(firstName, lastName, email, password);
        await signupPage.submitForm();

        // Wait for confirmation
        await driver.wait(until.elementLocated(By.css('.message-success')), 10000);

        // Sign out
        const accountPage = new AccountPage(driver);
        await accountPage.signOut();

        // Login
        const loginPage = new LoginPage(driver);
        await loginPage.open();
        await loginPage.login(email, password);

        // Locate the welcome text
    const welcomeElement = await driver.wait(
        until.elementLocated(By.css('.logged-in')),
        10000
    );

    // Ensure text is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Fetch the welcome text
    const welcomeText = await welcomeElement.getText();
    console.log('Actual Welcome Text:', welcomeText);

    // Assertion
    assert.strictEqual(
        welcomeText.trim(),
        `Welcome, ${fullName}!`,
        `Expected welcome text to be "Welcome, ${fullName}!", but got "${welcomeText}".`
    );

   
    console.log('Test passed: Signup, signout, and login successful.');

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await driver.quit();
    }
})();
