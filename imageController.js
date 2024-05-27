const express = require('express');
const multer = require('multer');
const { v1: uuidv1 } = require('uuid');
const azure = require('azure-storage');
const bodyParser = require('body-parser');
const ImageSchema = require('./models/ImageSchema');
const router = express.Router();
const blobService = azure.createBlobService();
const containerName = 'images';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const options = {
  contentSettings: {
    contentDisposition: 'inline'
  }
};
router.get('/', async (req, res) => {
  try {
    const images = await ImageSchema.find();
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/upload', upload.single("image"), async (req, res) => {
  const userId = req.user.sub
  const imageName = req.body.imageName
  const image = req.body.image
  console.log(image)
  const buffer = Buffer.from(image, 'base64');
  const blobName = `${uuidv1()}-${imageName}.png`;
  blobService.createBlockBlobFromText(containerName, blobName, buffer, options, async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error uploading image to Azure Blob Storage', err);
    }
    result.contentSettings.contentDisposition = 'inline'
    const imageUrl = blobService.getUrl(containerName, blobName);

    try {
      const newImage = new ImageSchema({
        userId,
        imageName,
        imageUrl
      });

      await newImage.save();
      return res.status(200).send('Image uploaded successfully');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error saving image metadata to Azure SQL Database', err);
    }
  });
});

router.delete('/:id', async (req, res)=> {
  const id = req.params.id;
  console.log(id)
  const result = await ImageSchema.deleteOne({_id: id});
  console.log(result)
  res.status(204).send()
})

module.exports = router;