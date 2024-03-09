import requests
import json
import time

# GraphQL endpoint
url = 'https://sui-testnet.mystenlabs.com/graphql'

# event type
package_id = "0x99b505d0e75a8e82bb1819bbd01115586f9a2c0ec35a0d311010d877eaf6157b"
package_name = "version3"
event_name1 = "RetetaMinted"
event_name2 = "RetetaBurned"

# emitting module
package_id2 = "0x01075e1e8916ff6a4c807556ad914477c2b37b6f90209267c4b4a37de10b4178"
package_name2 = "versionB"

output_folder = "/home/bpreda/vending_machine"
output_file = "order.json"
trace_events = ""

#   after: "eyJ0eCI6Njc2MywiZSI6MCwiYyI6MjI4MDA3NDJ9"
#   emittingModule: "0x3::sui_system",

INITIAL = ''
genesis = 0
while True:
    query = """
    query ByEmittingPackageModuleAndEventType {
    events(
        last: 1
        filter: {
        emittingModule: \""""+package_id2+"""::"""+package_name2+"""\",
        eventType: \""""+package_id+"""::"""+package_name+"""::"""+event_name2+"""\"
        }
    ) {
        nodes {
        sendingModule {
            name
        }
        type {
            repr
        }
        sender {
            address
        }
        timestamp
        json
        bcs
        }
    }
    }
    """
    # print(query)

    # Perform the HTTP POST request
    response = requests.post(url, json={'query': query})

    if response.status_code == 200:
        response_data = response.json()
        # print(response_data["data"]["events"]["nodes"])
        if len(response_data["data"]["events"]["nodes"]) == 0:
            print("="*20 + '\n' + "[*] No Events thus far")
            print()
            genesis = 1
        else:
            latest = response_data["data"]["events"]["nodes"][0]
            if INITIAL == "":
                if genesis:
                    INITIAL = latest["timestamp"]
                    print("="*20 + '\n' + "[*] New Event Detected!")
                    print(json.dumps(latest))
                    print()

                    # f = open(output_folder + output_file, 'w')
                    f = open("local_test.json", 'w')
                    f.write(json.dumps(latest))
                    f.flush()
                    f.close()
                else:
                    INITIAL = latest["timestamp"]
                    print("="*20 + '\n' + "[*] Initializing with ", INITIAL)
                    print(json.dumps(latest))
                    print()
            else:
                if INITIAL == latest["timestamp"]:
                    print("="*20 + '\n' + "[*] No new Events")
                    print()
                else:
                    INITIAL = latest["timestamp"]
                    print("="*20 + '\n' + "[*] New Event Detected!")
                    print(json.dumps(latest))
                    print()

                    # f = open(output_folder + output_file, 'w')
                    f = open("local_test.json", 'w')
                    f.write(json.dumps(latest))
                    f.flush()
                    f.close()
    else:
        print("="*20 + '\n' + "[!] Query failed to run by returning code of {}. {}".format(response.status_code, query))

    time.sleep(2)