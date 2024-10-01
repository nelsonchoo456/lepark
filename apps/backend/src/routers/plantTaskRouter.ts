import express from 'express';
import PlantTaskService from '../services/PlantTaskService';
import { PlantTaskSchemaType } from '../schemas/plantTaskSchema';
import { authenticateJWTStaff } from '../middleware/authenticateJWT';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.post('/createPlantTask', authenticateJWTStaff, async (req, res) => {
  try {
    const { submittingStaffId, ...plantTaskData } = req.body;
    const plantTask = await PlantTaskService.createPlantTask(plantTaskData, submittingStaffId);
    res.status(201).json(plantTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllPlantTasks', async (req, res) => {
  try {
    const plantTasks = await PlantTaskService.getAllPlantTasks();
    res.status(200).json(plantTasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewPlantTaskDetails/:id', async (req, res) => {
  try {
    const plantTaskId = req.params.id;
    const plantTask = await PlantTaskService.getPlantTaskById(plantTaskId);
    res.status(200).json(plantTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updatePlantTaskDetails/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const plantTaskId = req.params.id;
    const updateData: Partial<PlantTaskSchemaType> = req.body;

    const updatedPlantTask = await PlantTaskService.updatePlantTask(plantTaskId, updateData);
    res.status(200).json(updatedPlantTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deletePlantTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const plantTaskId = req.params.id;
    await PlantTaskService.deletePlantTask(plantTaskId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getPlantTasksByParkId/:parkId', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = parseInt(req.params.parkId, 10);
    const plantTasks = await PlantTaskService.getPlantTasksByParkId(parkId);
    res.status(200).json(plantTasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/upload', upload.array('files', 5), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedUrls = await PlantTaskService.uploadImages(files);
    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
