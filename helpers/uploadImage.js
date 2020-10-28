const User = require('../models/user');

const util = require("util");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

// Init gridfs
let gfs;

const connection = mongoose.connection;
connection.once('open', () => {
    // Init stream
    gfs = Grid(connection.db, mongoose.mongo);
    gfs.collection('photos');
});



 //UpLoad Profile picture
 var storage = new GridFsStorage({
    url: process.env.MONGO_LOCAL_CONN_URL.replace(
      '<password>',
      process.env.DATABASE_PASSWORD
    ),
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
      const match = ["image/png", "image/jpeg"];

      if (match.indexOf(file.mimetype) === -1) {
        const filename = `cooking_recipe-${Date.now()}-${file.originalname}`;
        return filename;
      }

      return {
        bucketName: "photos",
        filename: `cooking_recipe-${Date.now()}-${file.originalname}`
      };
    }
  });

exports.uploadFile = multer({ storage: storage }).single("file");
//var uploadFilesMiddleware = util.promisify(uploadFile);


// @route GET /image/:filename
// @desc Display Image
// @access Public
exports.displayImage = async function (req, res) {
  try {
      gfs.files.findOne({ 
        filename: req.params.filename 
      }, (err, file) => {
          // Check if file
          if (!file || file.length === 0) {
            return res.status(404).json({
              err: 'No file exists'
            });
          }

          // Check if image
          if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
          } else {
            res.status(404).json({
              err: 'Not an image'
            });
          }
        });
  } catch (error) {
      res.status(500).json({message: error.message})
  }
};
 
