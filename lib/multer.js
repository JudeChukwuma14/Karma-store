const multer = require("multer")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const fileFilter = (req, file, cb) => {
    const allowType = ["image/png", "image/jpg", "image/jpeg", "image/webp"]
    if (allowType.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Only PNG, JPG, JPEG and WEBP file are allowed"))
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).array("images", 5)

module.exports = upload