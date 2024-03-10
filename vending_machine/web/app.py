from flask import Flask, render_template, request
import cups

app = Flask(__name__)

@app.route('/')
def home():
    return """
    <script>
        function displayQR(){
            document.element.getElementsByClassName("showQR").style.display = "static";
            document.element.getElementsByClassName("initialPrompt").style.display = "none";
        }
    </script>
    <div class="initialPrompt">
        <h1> Press Me </h1>
        <button onClick="displayQR()">
    </div>
    <div class="showQR" style="display:none">
        <center>
            <img src="/home/bpreda/Downloads/img.png">
            <h1> Scan ME </h1>
        <center>
    </div>
    """
'''
@app.route('/print', methods=['POST'])
def print_image():
    conn = cups.Connection()
    printers = conn.getPrinters()
    printer_name = list(printers.keys())[0]
    conn.printFile(printer_name, '/home/bpreda/Downloads', 'Python_Status_print', {})
    return 'Image has been sent to the printer!'
'''
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

