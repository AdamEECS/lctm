from models.chat import Chat
from routes import *
import redis
import json


main = Blueprint('chat', __name__)

Model = Chat

red = redis.Redis(host='localhost', port=6379, db=0)
chat_channel = 'water'


def stream():
    pubsub = red.pubsub()
    pubsub.subscribe(chat_channel)
    for message in pubsub.listen():
        if message['type'] == 'message':
            data = message['data'].decode('utf-8')
            yield 'data: {}\n\n'.format(data)


@main.route('/')
def index():
    ms = Model.query.all()
    return render_template('chat_index.html', chat_list=ms)


@main.route('/add', methods=['POST'])
def add():
    msg = request.get_json()
    name = msg.get('name', '')
    if name == '':
        name = '<匿名>'
    content = msg.get('content', '')
    channel = msg.get('channel', '')
    r = {
        'name': name,
        'content': content,
        'channel': channel,
        'created_time': current_time(),
    }
    m = Model(r)
    m.save()
    print('add chat', m)
    message = json.dumps(r, ensure_ascii=False)
    red.publish(chat_channel, message)
    return 'OK'


@main.route('/subscribe')
def subscribe():
    s = stream()
    mime = 'text/event-stream'
    return Response(s, mimetype=mime)
