from flask import Flask, render_template, request, jsonify
import json

# Setup
app = Flask(__name__, template_folder='template', static_folder='static')

# Schedule Processing
full_schedule_data = {}

def processSchedule(data):
    global full_schedule_data
    data = data.decode('utf8').replace("'", '"')
    data = dict(json.loads(data))

    for i in range(1, 11, 1):
        full_schedule_data[i] = parseScheduleDay(data["{}_Pd2".format(i)], data["{}_Pd3".format(i)],
                                                 data["{}_Pd4".format(i)], data["{}_Pd5".format(i)],
                                                 data["{}_Notes".format(i)])

def parseScheduleDay(pd2, pd3, pd4, pd5, notes):
    return [
        parseScheduleRow(pd2),
        parseScheduleRow(pd3),
        parseScheduleRow(pd4),
        parseScheduleRow(pd5),
        notes
    ]

SUBJECTS = ["Bio", "CS", "ESS", "FOT"]
def getSubjectFromNotes(note):
    if "bio" in note.lower():
        return "Bio"
    if "cs" in note.lower():
        return "CS"
    if "ess" in note.lower():
        return "ESS"
    if "fot" in note.lower():
        return "FOT"
    return ""
def halfHalfNoteGenerator(first, second, side):
    res = []
    if first != "":
        res += "First Half: " + first
    if second != "":
        res += "Second Half: " + second
    res = ", ".join(res).strip()
    if side != "":
        if res != "":
            res += " | " + side
        else:
            res = side
    return res

def parseScheduleRow(row):
    # Takes a list of four strings
    # Returns a list in the format [X_Subj, X_Notes, Y_Subj, Y_Notes]

    xCount = 0
    yCount = 0
    xyCount = 0
    yxCount = 0
    
    content = [] # List of [Block(s), Subject, Notes] lists
    sideNotes = [] # Block-less Notes
    
    i = -1
    for block in row:
        i += 1

        if block == "":
            continue
        elif "XY" in block:
            xyCount += 1
            content += [["XY", SUBJECTS[i], block.replace("XY", "")]]
        elif "YX" in block:
            yxCount += 1
            content += [["YX", SUBJECTS[i], block.replace("YX", "")]]
        elif "X" == block[0] or "X" == block[-1]:
            xCount += 1
            content += [["X", SUBJECTS[i], block.replace("X", "")]]
        elif "Y" == block[0] or "Y" == block[-1]:
            yCount += 1
            content += [["Y", SUBJECTS[i], block.replace("Y", "")]]
        else:
            sideNotes += [block]

    content.sort(key = lambda x : x[0]) # Sort by Block
    sideNote = " ".join(sideNotes).strip()

    # Case 1: All Blank.
    # Case 2: One X, One Y
    # Case 3: No X & No Y, instead we have a "BIO QUIZ" or similar.
    # Case 4: XY and YX, or half periods.
    # Case 5: Only one XY, or merged periods.

    if len(content) == 0:
        if sideNote == "":
            # Case 1
            return ["-", "", "-", ""]
        else:
            # Case 3
            subj = getSubjectFromNotes(sideNote)
            if subj == "":
                return [sideNote, "", sideNote, ""]
            else: # Subject Detected
                return [subj, sideNote, subj, sideNote]
    elif len(content) == 2:
        if xCount == 1 and yCount == 1:
            # Case 2
            return [content[0][1], " ".join([content[0][2], sideNote]), content[1][1], " ".join([content[1][2], sideNote])]
        elif xyCount == 1 and yxCount == 1:
            # Case 4
            return [content[0][1] + " 🡢 " + content[1][1], halfHalfNoteGenerator(content[0][2], content[1][2], sideNote),
                    content[1][1] + " 🡢 " + content[0][1], halfHalfNoteGenerator(content[1][2], content[0][2], sideNote)]
    elif len(content) == 1:
        # Case 5
        return [content[0][1], " ".join([content[0][2], sideNote]), content[0][1], " ".join([content[0][2], sideNote])]
    
    # If we got here... that's really bad.
    return ["???", "Error", "???", "Error"]


######################
## WEBAPP INTERFACE ##
######################


# Handling POST Requests
@app.route('/', methods=['POST'])
def handle_post():
    print("Received a POST!")
    try:
        if request.method == 'POST':
            username = request.headers['username']
            password = request.headers['password']
            if username == "pilliam" and password == "Str@wberry Jam Collab 2021":
                data = request.data
                processSchedule(data)
                return "Uploaded!"
            else:
                return "Wrong Credentials!"
    except:
        return "Oh noes, an error occured!"

# Handling GET Requests
@app.route('/', methods=['GET'])
def handle_get():
    print("Received a GET!")
    response = jsonify({'body': full_schedule_data})
    response.headers.add('Access-Control-Allow-Origin', '*')
    print(response)
    return response

# Webapp
@app.route('/')
def index():
    return render_template('index.html')

def run():
    app.run(host='0.0.0.0',port=8080)