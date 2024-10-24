import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the HUB_IDENTIFIER_NO from environment variables
HUB_IDENTIFIER_NO = os.getenv("HUB_IDENTIFIER_NO")
IP_ADDRESS = os.getenv("IP_ADDRESS")
print(HUB_IDENTIFIER_NO)

# Backend URL
BASE_URL = f'http://{IP_ADDRESS}:3333/api'  # Replace with your actual backend URL

def test_verify_hub_initialization():
    endpoint = f"{BASE_URL}/hubs/verifyHubInitialization"
    
    # Prepare the payload
    payload = {
        "identifierNumber": HUB_IDENTIFIER_NO
    }
    
    try:
        # Send POST request to the endpoint
        response = requests.put(endpoint, json=payload, timeout=5)
        
        # Check the response
        if response.status_code == 200:
            data = response.json()
            if "token" in data:
                print(f"Initialization successful. Token: {data['token']}")
                return data['token']
            else:
                print("Unexpected response format")
        else:
            print(f"Error: Unexpected status code {response.status_code}")
            print(f"Response: {response.text}")
        
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
    
    return None

if __name__ == "__main__":
    print("Testing hub initialization...")
    token = test_verify_hub_initialization()
    if token:
        print("Test completed successfully")
    else:
        print("Test failed")