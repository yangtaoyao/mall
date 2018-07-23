const path = require('path');
const app = require('./server.js');

exports.accessOrigin = [
	'http://127.0.0.1:8080',
	'http://127.0.0.1:8081',
	'http://127.0.0.1',
];

exports.setUploadsPath = function(){
    // 文件上传目录
    app.set('admin_root', __dirname);
    // 临时上传路径
    app.set('tempuploadpath', path.join(app.get('admin_root'), 'uploads/temp'));
    // 文章图片上传路径
    app.set('articlepath', path.join(app.get('admin_root'), 'uploads/article'));
    // 附件上传路径
    app.set('filespath', path.join(app.get('admin_root'), 'uploads/files'));
};
