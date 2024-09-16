import multer from 'multer'
// import path from 'path'



// const fileFilter = (req, file, cb) => {
//   const extname = path.extname(file.originalname).toLocaleLowerCase()

//   const allowedExtensions = [
//     '.nes',
//     '.snes',
//     '.gb',
//     '.gba',
//     '.gbc',
//     '.sfc',
//     '.smc',
//     '.bin',
//     '.smd',
//     '.md',
//     '.gen',
//     '.jpg',
//     '.jpeg',
//     '.png',
//   ]

//   if (!allowedExtensions.includes(extname)) {
//     return cb(new Error('File format not allowed.'), false)
//   }

//   cb(null, true)
// }

const storage = multer.memoryStorage()

const limits = {
  fileSize: 50 * 1024 * 1024,
}

const upload = multer({
  storage,
  // fileFilter,
  limits,
})

export const multerStates = upload.single('state')

export const multerErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).send(err.message)
  } else if (err) {
    return res.status(500).send(err.message)
  }
  next()
}
