import express from 'express';
import PlantTaskService from '../services/PlantTaskService';
import { PlantTaskSchemaType } from '../schemas/plantTaskSchema';
import { authenticateJWTStaff } from '../middleware/authenticateJWT';
import multer from 'multer';
import { PlantTaskStatusEnum } from '@prisma/client';

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

router.get('/getAllPlantTasksByParkId/:parkId', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = parseInt(req.params.parkId, 10);
    const plantTasks = await PlantTaskService.getAllPlantTasksByParkId(parkId);
    res.status(200).json(plantTasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllAssignedPlantTasks/:staffId', authenticateJWTStaff, async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const plantTasks = await PlantTaskService.getAllAssignedPlantTasks(staffId);
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

router.put('/assignPlantTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const { assignerStaffId, staffId } = req.body;
    const plantTaskId = req.params.id;
    const updatedPlantTask = await PlantTaskService.assignPlantTask(plantTaskId, assignerStaffId, staffId);
    res.status(200).json(updatedPlantTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/unassignPlantTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const { unassignerStaffId } = req.body;
    const plantTaskId = req.params.id;
    const updatedPlantTask = await PlantTaskService.unassignPlantTask(plantTaskId, unassignerStaffId);
    res.status(200).json(updatedPlantTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/completePlantTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const { staffId } = req.body;
    const plantTaskId = req.params.id;
    const updatedPlantTask = await PlantTaskService.completePlantTask(plantTaskId, staffId);
    res.status(200).json(updatedPlantTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/acceptPlantTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const { staffId } = req.body;
    const plantTaskId = req.params.id;
    const updatedPlantTask = await PlantTaskService.acceptPlantTask(staffId, plantTaskId);
    res.status(200).json(updatedPlantTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/unacceptPlantTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const plantTaskId = req.params.id;
    const updatedPlantTask = await PlantTaskService.unacceptPlantTask(plantTaskId);
    res.status(200).json(updatedPlantTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updatePlantTaskStatus/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const plantTaskId = req.params.id;
    const { newStatus } = req.body;
    const updatedPlantTask = await PlantTaskService.updatePlantTaskStatus(plantTaskId, newStatus);
    res.status(200).json(updatedPlantTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updatePlantTaskPosition/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const plantTaskId = req.params.id;
    const { newPosition } = req.body;
    const updatedPlantTask = await PlantTaskService.updatePlantTaskPosition(plantTaskId, newPosition);
    res.status(200).json(updatedPlantTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getPlantTasksByStatus/:status', authenticateJWTStaff, async (req, res) => {
  try {
    const status = req.params.status as PlantTaskStatusEnum;
    const plantTasks = await PlantTaskService.getPlantTasksByStatus(status);
    res.status(200).json(plantTasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteMany', async (req, res) => {
  try {
    const taskStatus = req.query.taskStatus ? req.query.taskStatus  as PlantTaskStatusEnum : null;
    await PlantTaskService.deleteTaskskByStatus(taskStatus);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkPlantTaskCompletionRates', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const staffCompletionRates = await PlantTaskService.getParkPlantTaskCompletionRates(parkId, startDate, endDate);
    res.status(200).json(staffCompletionRates);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkPlantTaskOverdueRates', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const staffOverdueRates = await PlantTaskService.getParkPlantTaskOverdueRates(parkId, startDate, endDate);
    res.status(200).json(staffOverdueRates);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkAverageTaskCompletionTime', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const staffAverageCompletionTimes = await PlantTaskService.getParkAverageTaskCompletionTime(parkId, startDate, endDate);
    res.status(200).json(staffAverageCompletionTimes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkTaskLoadPercentage', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const staffTaskLoadPercentages = await PlantTaskService.getParkTaskLoadPercentage(parkId);
    res.status(200).json(staffTaskLoadPercentages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getStaffPerformanceRanking', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const staffPerformance = await PlantTaskService.getStaffPerformanceRanking(parkId, startDate, endDate);
    res.status(200).json(staffPerformance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
