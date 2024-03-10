import requests
import json
import time

# GraphQL endpoint
url = 'https://sui-testnet.mystenlabs.com/graphql'

# event type
package_id = "0x32bf46572bc1f2e341a3bd09d06dfc11934f72edc5458f88fdb175656c5159ef"
package_name = "version4"
event_name1 = "RetetaMinted"
event_name2 = "RetetaBurned"

# emitting module
package_id2 = "0x1ddf75d66e2609dc451cd35c34ebc14618ceb58183da71611506e8903cee7ddb"
package_name2 = "versionC"

output_folder = "/home/bpreda/"
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

                    f = open(output_folder + output_file, 'w')
                    # f = open("local_test.json", 'w')
                    f.write(json.dumps(latest))
                    f.flush()
                    f.close()
    else:
        print("="*20 + '\n' + "[!] Query failed to run by returning code of {}. {}".format(response.status_code, query))

    time.sleep(2)