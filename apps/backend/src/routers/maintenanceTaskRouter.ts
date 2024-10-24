import express from 'express';
import MaintenanceTaskService from '../services/MaintenanceTaskService'
import { MaintenanceTaskSchemaType } from '../schemas/maintenanceTaskSchema';
import { authenticateJWTStaff } from '../middleware/authenticateJWT';
import multer from 'multer';
import { MaintenanceTaskStatusEnum, MaintenanceTaskTypeEnum } from '@prisma/client';

const router = express.Router();
const upload = multer();

router.post('/createMaintenanceTask', authenticateJWTStaff, async (req, res) => {
  try {
    const { submittingStaffId, ...maintenanceTaskData } = req.body;
    const maintenanceTask = await MaintenanceTaskService.createMaintenanceTask(maintenanceTaskData, submittingStaffId);
    res.status(201).json(maintenanceTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllMaintenanceTasks', async (req, res) => {
  try {
    const maintenanceTasks = await MaintenanceTaskService.getAllMaintenanceTasks();
    res.status(200).json(maintenanceTasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewMaintenanceTaskDetails/:id', async (req, res) => {
  try {
    const maintenanceTaskId = req.params.id;
    const maintenanceTask = await MaintenanceTaskService.getMaintenanceTaskById(maintenanceTaskId);
    res.status(200).json(maintenanceTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateMaintenanceTaskDetails/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const maintenanceTaskId = req.params.id;
    const updateData: Partial<MaintenanceTaskSchemaType> = req.body;

    const updatedMaintenanceTask = await MaintenanceTaskService.updateMaintenanceTask(maintenanceTaskId, updateData);
    res.status(200).json(updatedMaintenanceTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteMaintenanceTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const maintenanceTaskId = req.params.id;
    await MaintenanceTaskService.deleteMaintenanceTask(maintenanceTaskId);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteMaintenanceTasksByStatus/:status', authenticateJWTStaff, async (req, res) => {
  try {
    const taskStatus = req.params.status as MaintenanceTaskStatusEnum;
    await MaintenanceTaskService.deleteMaintenanceTasksByStatus(taskStatus);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getMaintenanceTasksByParkId/:parkId', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = parseInt(req.params.parkId, 10);
    const maintenanceTasks = await MaintenanceTaskService.getMaintenanceTasksByParkId(parkId);
    res.status(200).json(maintenanceTasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllAssignedMaintenanceTasks/:staffId', authenticateJWTStaff, async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const maintenanceTasks = await MaintenanceTaskService.getAllMaintenanceTasksByStaffId(staffId);
    res.status(200).json(maintenanceTasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getMaintenanceTasksBySubmittingStaff/:staffId', authenticateJWTStaff, async (req, res) => {
  try {
    const staffId = req.params.staffId;
    const maintenanceTasks = await MaintenanceTaskService.getMaintenanceTasksBySubmittingStaff(staffId);
    res.status(200).json(maintenanceTasks);
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

    const uploadedUrls = await MaintenanceTaskService.uploadImages(files);
    res.status(200).json({ uploadedUrls });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.put('/assignMaintenanceTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const { staffId } = req.body;
    const maintenanceTaskId = req.params.id;
    const updatedMaintenanceTask = await MaintenanceTaskService.assignMaintenanceTask(maintenanceTaskId, staffId);
    res.status(200).json(updatedMaintenanceTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/unassignMaintenanceTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const { unassignerStaffId } = req.body;
    const maintenanceTaskId = req.params.id;
    const updatedMaintenanceTask = await MaintenanceTaskService.unassignMaintenanceTask(maintenanceTaskId, unassignerStaffId);
    res.status(200).json(updatedMaintenanceTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/completeMaintenanceTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const { staffId } = req.body;
    const maintenanceTaskId = req.params.id;
    const updatedMaintenanceTask = await MaintenanceTaskService.completeMaintenanceTask(maintenanceTaskId, staffId);
    res.status(200).json(updatedMaintenanceTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/acceptMaintenanceTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const { staffId } = req.body;
    const maintenanceTaskId = req.params.id;
    const updatedMaintenanceTask = await MaintenanceTaskService.acceptMaintenanceTask(maintenanceTaskId, staffId);
    res.status(200).json(updatedMaintenanceTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/unacceptMaintenanceTask/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const maintenanceTaskId = req.params.id;
    const updatedMaintenanceTask = await MaintenanceTaskService.unacceptMaintenanceTask(maintenanceTaskId);
    res.status(200).json(updatedMaintenanceTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateMaintenanceTaskStatus/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const maintenanceTaskId = req.params.id;
    const { newStatus } = req.body;
    const updatedMaintenanceTask = await MaintenanceTaskService.updateMaintenanceTaskStatus(maintenanceTaskId, newStatus);
    res.status(200).json(updatedMaintenanceTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateMaintenanceTaskPosition/:id', authenticateJWTStaff, async (req, res) => {
  try {
    const maintenanceTaskId = req.params.id;
    const { newPosition } = req.body;
    const updatedMaintenanceTask = await MaintenanceTaskService.updateMaintenanceTaskPosition(maintenanceTaskId, newPosition);
    res.status(200).json(updatedMaintenanceTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkMaintenanceTaskAverageCompletionTimeForPeriod', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const averageCompletionTime = await MaintenanceTaskService.getParkMaintenanceTaskAverageCompletionTimeForPeriod(parkId, startDate, endDate);
    res.status(200).json(averageCompletionTime);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkMaintenanceTaskOverdueRateForPeriod', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const overdueRate = await MaintenanceTaskService.getParkMaintenanceTaskOverdueRateForPeriod(parkId, startDate, endDate);
    res.status(200).json(overdueRate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkMaintenanceTaskCriticalTaskTypesForPeriod', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const criticalTaskTypes = await MaintenanceTaskService.getCriticalTaskTypesIdentification(parkId, startDate, endDate);
    res.status(200).json(criticalTaskTypes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkMaintenanceTaskTaskTypeEfficiencyRanking', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const ranking = await MaintenanceTaskService.getTaskTypeEfficiencyRanking(parkId, startDate, endDate);
    res.status(200).json(ranking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkMaintenanceTaskTrendAnalysis', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const previousStartDate = new Date(req.query.previousStartDate as string);
    const previousEndDate = new Date(req.query.previousEndDate as string);
    const trendAnalysis = await MaintenanceTaskService.getTrendAnalysis(parkId, startDate, endDate, previousStartDate, previousEndDate);
    res.status(200).json(trendAnalysis);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkMaintenanceTaskOverdueRateAnalysis', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const overdueRateAnalysis = await MaintenanceTaskService.getOverdueRateAnalysis(parkId, startDate, endDate);
    res.status(200).json(overdueRateAnalysis);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getParkMaintenanceTaskTaskTypeComparisonAnalysis', authenticateJWTStaff, async (req, res) => {
  try {
    const parkId = req.query.parkId ? parseInt(req.query.parkId as string, 10) : null;
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);
    const comparisonAnalysis = await MaintenanceTaskService.getTaskTypeComparisonAnalysis(parkId, startDate, endDate);
    res.status(200).json(comparisonAnalysis);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add other routes similar to the plantTaskRouter, such as getParkTaskLoadPercentage, getStaffPerformanceRanking, etc.

export default router;