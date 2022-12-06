import multer from 'multer';
import path from 'path'
import {generateId} from '../helpers/tokens.js'

const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null, './public/uploads/')
    },
    filename: (req, file, cb)=> {
        cb(null, generateId() + path.extname(file.originalname) )
    }
})

const upload = multer({ storage })

export default upload