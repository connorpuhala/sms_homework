""" Initializes the model bases without mounting it to the Flask App. """


from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()

class Messages(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    message_body = db.Column(db.String(400))
    phone_number = db.Column(db.String(100))
    date = db.Column(db.String(100))
    message_type = db.Column(db.String(100))
    product_id = db.Column(db.Integer)
    user_id = db.Column(db.Integer)


