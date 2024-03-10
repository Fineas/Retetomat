from flask import Flask, render_template, jsonify
import json
import os
import time

item_st_sus = "Fucidin"
item_dr_jos = "Nurofen Express"
item2_dr_sus = "Advil Raceala si Gripa"
item2_st_sus = "Exoderil"
try:
    import RPi.GPIO as GPIO
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)


    servo_pins = {
    item_dr_jos: 13, 
    item_st_sus: 19   
    }

    # Setup servo pins
    for pin in servo_pins.values():
        GPIO.setup(pin, GPIO.OUT)

except ImportError:
    print("RPi.GPIO module not found. GPIO functionality will not work.")

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/spin-rotors', methods=['POST'])
def spin_rotors():

    json_file_path = '/home/bpreda/order.json'
    time.sleep(3)
    while not os.path.exists(json_file_path):
          time.sleep(0.5)
    if os.path.exists(json_file_path):
        with open(json_file_path, 'r') as file:
            data = json.load(file)

            print("Parsed JSON data:", data)

            try:
              
                def move_servo(pin, angle):
                    pwm = GPIO.PWM(pin, 50)
                    pwm.start(0)
                    duty_cycle = angle / 18.0 + 2.5
                    pwm.ChangeDutyCycle(duty_cycle)
                    time.sleep(3)
                    pwm.stop()

                # Function to control servos based on items
                def control_servos(items):
                    for item in items:
                        if item in servo_pins:
                            pin = servo_pins[item]

                            if item == "Fucidin": # Moooveee for Herbion
                                move_servo(pin, 0)  
                                time.sleep(8)
                            elif item == "Nurofen Express":
                                move_servo(pin, 0)  
                                time.sleep(8) 
                            else:
                                print("Unknown item:", item)
                        else:
                            print("No servo assigned for item:", item)

                if __name__ == "__main__":
                    # Read JSON data from file
                    with open('/home/bpreda/order.json', 'r') as file:
                        data = json.load(file)

                    items = data['json']['items']

                    control_servos(items)
                    if os.path.exists('/home/bpreda/order.json'):
                        os.remove('/home/bpreda/order.json')

                pass
            except NameError:
                print("GPIO functionality is not available.")
            return jsonify({'status': 'success', 'message': 'Sănătate și numai bine!'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'N-am gasit fișieru boss'}), 404

if __name__ == '__main__':
    app.run(debug=True)