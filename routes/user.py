from models.user import User
from routes import *


main = Blueprint('user', __name__)

Model = User

chat_channel = 'water'


def current_user():
    uid = int(session.get('uid', -1))
    u = User.query.get(uid)
    return u


@main.route('/login')
def index():
    return render_template('login.html')


@main.route('/login', methods=['POST'])
def login():
    form = request.form
    username = form.get('username', '')
    u = User.query.filter_by(username=username).first()
    if u is not None and u.validate_login(form):
        session['uid'] = u.id
        return redirect(url_for('chat.index'))
    else:
        return redirect(url_for('.index'))


@main.route('/register', methods=['POST'])
def register():
    form = request.form
    u = User(form)
    status, msgs = u.valid()
    if status is True:
        u.save()
        session['uid'] = u.id
        # default channel is water
        session['room'] = chat_channel
        return redirect(url_for('chat.index'))
    else:
        return render_template('login.html', msgs=msgs)

@main.route('/profile')
def profile():
    cu = current_user()
    return render_template('user_profile.html', cu=cu)


@main.route('/uploadavatar', methods=['POST'])
def avatar():
    form = request.form
    username = form.get('username', '')
    u = User.query.filter_by(username=username).first()
    avatar = request.files['avatar']
    u.update_avatar(avatar)
    return redirect(url_for('.profile'))
