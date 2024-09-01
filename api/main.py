from flask import Flask, render_template, request, jsonify
import json

# Setup
app = Flask(__name__, template_folder='template', static_folder='static')

# Schedule Processing
current_schedule = {}
def process_schedule(data):
    global current_schedule
    data = data.decode('utf8').replace("'", '"')
    data = json.loads(data)
    current_schedule = dict(data)

def format_schedule(res):
    return res


######################
## WEBAPP INTERFACE ##
######################


# Handling POST Requests
@app.route('/', methods=['POST'])
def handle_post():
    print("Received a POST!")
    if request.method == 'POST':
        username = request.headers['username']
        password = request.headers['password']
        if username == "pilliam" and password == "Str@wberry Jam Collab 2021":
            data = request.data
            process_schedule(data)
            return "Success!"
        else:
            return "Failure!"

# Handling GET Requests
@app.route('/', methods=['GET'])
def handle_get():
    print("Received a GET!")
    response = jsonify({'body': current_schedule})
    response.headers.add('Access-Control-Allow-Origin', '*')
    print(response)
    return response

# Webapp
@app.route('/')
def index():
    return render_template('index.html')

def run():
    app.run(host='0.0.0.0',port=8080)