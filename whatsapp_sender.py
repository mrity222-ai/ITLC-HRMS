# ==============================================================================
# 🤖 HRMS AUTOMATED WHATSAPP LOGINS SENDER (PYTHON SCRIPT)
# ==============================================================================
# This script reads your onboarding logins CSV file and automatically delivers
# credentials to each employee's phone number using WhatsApp Web automation.
#
# Requirements (Run these in your command prompt/terminal before starting):
#   pip install pandas pywhatkit
#
# Setup Steps:
#   1. Make sure you are logged in to WhatsApp Web on your default Chrome browser.
#   2. Go to your HRMS Admin Dashboard -> Credentials Hub -> Click "Export".
#      (This downloads the logins sheet to your Downloads folder).
#   3. Run the script: python whatsapp_sender.py
# ==============================================================================

import os
import time
import pandas as pd
import pywhatkit as kit

# --- CONFIGURATION ---
# The script will search for the file in your Downloads folder first, then the current folder
downloads_path = os.path.expanduser("~/Downloads/onboarded_employee_logins.csv")
local_path = "onboarded_employee_logins.csv"
# ---------------------

def send_bulk_whatsapp():
    # Resolve which file exists
    csv_file_name = None
    if os.path.exists(downloads_path):
        csv_file_name = downloads_path
        print(f"📂 Found logins file in Downloads folder: {csv_file_name}")
    elif os.path.exists(local_path):
        csv_file_name = local_path
        print(f"📂 Found logins file in local folder: {csv_file_name}")
    else:
        print("❌ Error: 'onboarded_employee_logins.csv' not found!")
        print(f"Tried locations:\n  1. {downloads_path}\n  2. {os.path.abspath(local_path)}")
        print("\nPlease go to your HRMS Credentials Hub, click 'Export', and run this script again.")
        return

    print(f"📖 Reading credentials from {csv_file_name}...")
    try:
        # Load CSV (expects columns: Name, Email, Employee ID, Password, Phone)
        df = pd.read_csv(csv_file_name)
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        return

    # Check columns
    required_cols = ["Name", "Employee ID", "Password"]
    for col in required_cols:
        if col not in df.columns:
            print(f"❌ Error: CSV must contain '{col}' column!")
            print(f"Found columns: {list(df.columns)}")
            return

    # We also need a Phone column
    if "Phone" not in df.columns:
        # Try to find common column names for phone
        found_phone = False
        for c in df.columns:
            if "phone" in c.lower() or "mobile" in c.lower() or "contact" in c.lower():
                df.rename(columns={c: "Phone"}, inplace=True)
                print(f"👉 Renamed '{c}' column to 'Phone' for sending.")
                found_phone = True
                break
        if not found_phone:
            print("❌ Error: 'Phone' column not found in CSV. Please edit the CSV and add a 'Phone' column containing mobile numbers.")
            return

    print(f"🚀 Loaded {len(df)} employees. Starting WhatsApp automation in 5 seconds...")
    print("⚠️ Please keep your WhatsApp Web browser tab open and logged in.")
    time.sleep(5)

    for index, row in df.iterrows():
        name = row["Name"]
        emp_id = row["Employee ID"]
        password = row["Password"]
        phone = str(row["Phone"]).strip()

        # Clean phone number
        phone = phone.replace(".0", "") # Remove float endings if read from excel
        phone = "".join(filter(str.isdigit, phone)) # Keep only digits

        if not phone:
            print(f"⏭️ Skipping {name}: Phone number is missing.")
            continue

        # Add India prefix +91 if length is 10 digits
        if len(phone) == 10:
            phone_with_code = "+91" + phone
        elif len(phone) > 10 and not phone.startswith("+"):
            phone_with_code = "+" + phone
        else:
            phone_with_code = phone if phone.startswith("+") else "+" + phone

        # Customize your WhatsApp Welcome Message template here
        message = (
            f"Hi *{name}*,\n\n"
            f"Welcome to the team! Your employee account has been created on the HRMS Portal.\n\n"
            f"Here are your login credentials:\n"
            f"🔑 *Employee ID (Username):* `{emp_id}`\n"
            f"🔒 *Temporary Password:* `{password}`\n\n"
            f"💻 *Portal URL:* https://gold-stork-993357.hostingersite.com\n\n"
            f"Please change your password after your first login."
        )

        print(f"✉️ Sending credentials to {name} ({phone_with_code})...")
        try:
            # kit.sendwhatmsg_instantly(phone_no, message, wait_time, tab_close, close_time)
            # Opens browser, types message, waits 15s to ensure load, sends, closes tab after 4s.
            kit.sendwhatmsg_instantly(
                phone_no=phone_with_code,
                message=message,
                wait_time=15,
                tab_close=True,
                close_time=4
            )
            print(f"✅ Message sent successfully to {name}!")
            time.sleep(5) # Inter-message cooldown to prevent API flooding
        except Exception as e:
            print(f"❌ Failed to send message to {name}: {e}")

    print("\n🎉 Bulk WhatsApp credential delivery completed!")

if __name__ == "__main__":
    send_bulk_whatsapp()
