import os
import json
import datetime

from flask import Flask
from flask import render_template
from flask import send_from_directory
from flask import request
from flaskext import uploads

from model import ItemManager


app = Flask(__name__)
app.config['UPLOADED_FILES_DEST'] = '%s/uploads' % os.getcwd()
files = uploads.UploadSet('files')
uploads.configure_uploads(app, [files])
start_time = datetime.datetime.now()

item_manager = ItemManager()


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/admin/')
def admin():
    return render_template('admin.html')


@app.route('/admin/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return 'Must provide "file" in request'
    filename = files.save(request.files['file'])
    item_manager.create(filename)
    item_manager.save_to_disk()
    return 'upload'


@app.route('/admin/update', methods=['POST'])
def update_data():
    data_str = request.data.decode('utf-8')
    data = json.loads(data_str)
    print (data, data_str)
    if 'items' in data:
        for item_data in data['items']:
            item = item_manager.get(item_data.get('name'))
            if 'active' in item_data:
                item.active = bool(item_data['active'])
            if 'time' in item_data:
                item.time = int(item_data['time'])
    item_manager.save_to_disk()
    return 'updated'


@app.route('/static/<name>')
def static_files(name):
    print (name)
    dir_ = {
      'dropzone.css': 'lib/dropzone/dist/',
      'dropzone.js': 'lib/dropzone/dist/',
      'app.js': 'js/',
    }[name]
    return send_from_directory(dir_, name)


@app.route('/uploads/<name>')
def uploaded_files(name):
    print ("ul", name)
    return send_from_directory(app.config['UPLOADED_FILES_DEST'], name)


@app.route('/data.json')
def data():
    #files = os.listdir(app.config['UPLOADED_FILES_DEST'])
    #data = [{'name': k, 'url': '/uploads/%s' % k} for k in files]
    return json.dumps({
        'time': datetime.datetime.now().isoformat(),
        'items': [item.to_data_dict() for item in item_manager.items.values()],
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
