import express from 'express';
import HubService from '../services/HubService';

const router = express.Router();

router.post('/createHub', async (req, res) => {
  try {
    const hub = await HubService.createHub(req.body);
    res.status(201).json(hub);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllHubs', async (req, res) => {
  try {
    const hubs = await HubService.getAllHubs();
    res.status(200).json(hubs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getHubById/:id', async (req, res) => {
  try {
    const hub = await HubService.getHubById(req.params.id);
    if (hub) {
      res.status(200).json(hub);
    } else {
      res.status(404).json({ error: 'Hub not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateHubDetails/:id', async (req, res) => {
  try {
    const hub = await HubService.updateHubDetails(req.params.id, req.body);
    res.status(200).json(hub);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteHub/:id', async (req, res) => {
  try {
    await HubService.deleteHub(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
