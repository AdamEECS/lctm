from flask_socketio import SocketIO
from flask import session
from flask_socketio import emit
from flask_socketio import join_room
from flask_socketio import leave_room

socketio = SocketIO()

def current_user():
    from models.user import User
    uid = int(session.get('uid', -1))
    u = User.query.get(uid)
    return u

@socketio.on('connect')
def connect():
    print('connected', current_user().id)
    message = {
        'type': 'join',
        'channel': '大厅',
        'username': current_user().username,
        'avatar': current_user().avatar,
    }
    print(message)
    emit('message', message, broadcast=True)


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected', current_user().id)


@socketio.on('text')
def text(message):
    """Sent by a client when the user entered a new message.
    The message is sent to all people in the room."""
    # room = message.get('channel')
    message['type'] = 'message'
    message['username'] = current_user().username
    message['avatar'] = current_user().avatar
    print(message)
    emit('message', message, broadcast=True)
