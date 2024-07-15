import csv
import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
import time
import os
from selenium.common.exceptions import NoSuchElementException
# Construct the file URL using os.path.abspath and os.path.join
base_path = os.path.abspath(os.path.dirname(__file__))
file_path = os.path.join(base_path, 'index.html')
file_url = f"file:///{file_path.replace(os.path.sep, '/')}"
print(file_url)

# Function to read card details from CSV file
def read_card_details_from_csv(file_path):
    with open(file_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            yield row

@pytest.fixture(scope="module")
def setup():
    # Initialize the WebDriver
    driver = webdriver.Edge()
    
    yield driver
    driver.quit()

@pytest.mark.parametrize("card_details", read_card_details_from_csv("test_cases.csv"))
def test_card_form_validation(setup, card_details):
    driver = setup
    driver.get(file_url)  # Reload the page to reset the form

    card_number = card_details['card_number']
    card_holder = card_details['card_holder']
    exp_month = card_details['exp_month']
    exp_year = card_details['exp_year']
    cvv = card_details['cvv']
    expected_result = card_details['expected_result']

    # Clear and fill the card number
    driver.find_element(By.ID, "cardNumber").clear()
    driver.find_element(By.ID, "cardNumber").send_keys(card_number)

    # Clear and fill the card holder's name
    driver.find_element(By.ID, "cardName").clear()
    driver.find_element(By.ID, "cardName").send_keys(card_holder)

    # Select the expiration month
    try:
        Select(driver.find_element(By.ID, "cardMonth")).select_by_visible_text(exp_month)
    except NoSuchElementException:
        driver.execute_script(f'alert("Invalid expiration month: {exp_month}");')
        time.sleep(1)
        driver.switch_to.alert.accept()
        return  # Skip further validation for this test case

    # Select the expiration year
    try:
        Select(driver.find_element(By.ID, "cardYear")).select_by_visible_text(exp_year)
    except NoSuchElementException:
        driver.execute_script(f'alert("Invalid expiration year: {exp_year}");')
        time.sleep(1)
        driver.switch_to.alert.accept()
        return  # Skip further validation for this test case

    # Clear and fill the CVV
    driver.find_element(By.ID, "cardCvv").clear()
    driver.find_element(By.ID, "cardCvv").send_keys(cvv)

    # Submit the form
    driver.find_element(By.CSS_SELECTOR, ".card-form__button").click()

    # Capture alert text if any
    alert_text = ""
    try:
        alert = driver.switch_to.alert
        alert_text = alert.text
        time.sleep(1)
        alert.accept()
    except:
        pass

    # Validate the result
    if expected_result == "valid":
        assert "Card details are valid! Submitting..." in alert_text, f"Expected valid but got {alert_text}"
    else:
        assert "invalid" in alert_text, f"Expected invalid but got {alert_text}"

    # Wait for a few seconds to see the result
   
