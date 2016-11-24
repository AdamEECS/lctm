from models.channel import Channel

from . import *


main = Blueprint('channel', __name__)

Model = Channel


@main.route('/')
def index():
    ms = Model.query.all()
    return render_template('channel_index.html', channel_list=ms)


@main.route('/add', methods=['POST'])
def add():
    form = request.form
    m = Model(form)
    m.save()
    return redirect(url_for('.index'))


@main.route('/delete/<int:id>')
def delete(id):
    m = Model.query.get(id)
    m.delete()
    return redirect(url_for('.index'))


@main.route('/edit/<int:id>')
def edit(id):
    m = Model.query.get(id)
    return render_template('channel_edit.html', channel=m)


@main.route('/update', methods=['post'])
def update():
    form = request.form
    m = Model(form)
    m.update(form)
    return redirect(url_for('.index'))
