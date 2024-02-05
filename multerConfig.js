const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  });
const upload = multer({ storage: storage });

// const storageVideo = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./videos");
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//       cb(null, uniqueSuffix + "-" + file.originalname);
//     },
//   });
// const videoUpload = multer({ storage: storageVideo });

module.exports = upload;
//module.exports = videoUpload;

// const multer = require('multer');

// const storage = multer.memoryStorage(); // Use memory storage for buffer
// const upload = multer({ storage: storage });

// module.exports = upload;
