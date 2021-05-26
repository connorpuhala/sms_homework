""" The main Flask application file that bootstraps and starts the app. """

import os
import json
from twilio.rest import Client

from flask import request
from flask_cors import CORS, cross_origin

from bootstrap import app_factory, database_factory
from models import *

# Init App
app = app_factory()

db = database_factory(app)
db.create_all()

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# Database Functions
def get_all(model):
    data = model.query.all()
    return data

def add_instance(model, **kwargs):
    instance = model(**kwargs)
    db.session.add(instance)
    commit_changes()

def delete_instance(model, id):
    model.query.filter_by(id=id).delete()
    commit_changes()

def edit_instance(model, id, **kwargs):
    instance = model.query.filter_by(id=id).all()[0]
    for attr, new_value in kwargs.items():
        setattr(instance, attr, new_value)
    commit_changes()

def commit_changes():
    db.session.commit()


# API Endpoints (Crud)
@app.route("/health-check")
def health_check():
    return {"success": True}

@app.route('/', methods=['GET'])
@cross_origin()
def grabMessages():
    messages = get_all(Messages)
    all_messages = []
    for message in messages:
        new_message = {
            "id": message.id,
            "message_body": message.message_body,
            "phone_number": message.phone_number,
            "date": message.date,
            "message_type": message.message_type,
            "product_id": message.product_id,
            "user_id": message.user_id
        }

        all_messages.append(new_message)
    return json.dumps(all_messages), 200


@app.route('/add', methods=['POST'])
@cross_origin()
def add():
    data = request.get_json()
    message_body = data['message_body']
    phone_number = data['phone_number']
    date = data['date']
    message_type = data['message_type']
    product_id = data['product_id']
    user_id = data['user_id']

    add_instance(Messages, message_body=message_body, phone_number=phone_number, date=date, message_type=message_type, product_id=product_id, user_id=user_id)
    return json.dumps("Added"), 200


@app.route('/remove/<message_id>', methods=['DELETE'])
@cross_origin()
def remove(message_id):
    delete_instance(Messages, id=message_id)
    return json.dumps("Deleted"), 200


@app.route('/edit/<message_id>', methods=['PATCH'])
@cross_origin()
def edit(message_id):
    data = request.get_json()
    new_message_body = data['message_body']
    new_phone_number = data['phone_number']
    new_date = data['date']
    new_message_type = data['message_type']
    edit_instance(Messages, id=message_id, message_body=new_message_body, phone_number=new_phone_number, date=new_date, message_type=new_message_type)
    return json.dumps("Edited"), 200


# Twilio API
@app.route('/send-message/', methods=['POST'])
@cross_origin()
def send_message():
    myMessage = request.json['message_body']
    myNumber = '+1' + request.json['phone_number']

    account_sid = 'AC4eac629081a1183c4bc47aab75c09c00'
    auth_token = 'dcfc391ec980482393c8baba68e847d4'
    client = Client(account_sid, auth_token)

    returnMessage = client.messages \
                            .create(
                                body=myMessage,
                                from_='+14159937658',
                                to=myNumber,
                            )
    return "Sent"

if __name__ == "__main__":
    app.run(debug=os.environ.get("FLASK_DEBUG", False))
