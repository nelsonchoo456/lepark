import express from 'express';
import AttractionTicketService from '../services/AttractionTicketService';
import { AttractionTicketStatusEnum } from '@prisma/client';

const router = express.Router();

// AttractionTicketTransaction routes
router.post('/createAttractionTicketTransaction', async (req, res) => {
  try {
    const transaction = await AttractionTicketService.createAttractionTicketTransaction(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAllAttractionTicketTransaction', async (req, res) => {
  try {
    const transactions = await AttractionTicketService.getAllAttractionTicketTransactions();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewAttractionTicketTransactionDetails/:id', async (req, res) => {
  try {
    const transaction = await AttractionTicketService.getAttractionTicketTransactionById(req.params.id);
    res.status(200).json(transaction);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getAttractionTicketTransactionsByVisitorId/:visitorId', async (req, res) => {
  try {
    const transactions = await AttractionTicketService.getAttractionTicketTransactionsByVisitorId(req.params.visitorId);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAttractionTicketTransactionsByAttractionId/:attractionId', async (req, res) => {
  try {
    const transactions = await AttractionTicketService.getAttractionTicketTransactionsByAttractionId(req.params.attractionId);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteAttractionTicketTransaction/:id', async (req, res) => {
  try {
    await AttractionTicketService.deleteAttractionTicketTransaction(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// AttractionTicket routes
router.post('/createAttractionTicket', async (req, res) => {
  try {
    const ticket = await AttractionTicketService.createAttractionTicket(req.body);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/viewAttractionTicketDetails/:id', async (req, res) => {
  try {
    const ticket = await AttractionTicketService.getAttractionTicketById(req.params.id);
    res.status(200).json(ticket);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getAllAttractionTickets', async (req, res) => {
  try {
    const tickets = await AttractionTicketService.getAllAttractionTickets();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/deleteAttractionTicket/:id', async (req, res) => {
  try {
    await AttractionTicketService.deleteAttractionTicket(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/getAttractionTicketsByTransactionId/:transactionId', async (req, res) => {
  try {
    const tickets = await AttractionTicketService.getAttractionTicketsByTransactionId(req.params.transactionId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/getAttractionTicketsByListingId/:listingId', async (req, res) => {
  try {
    const tickets = await AttractionTicketService.getAttractionTicketsByListingId(req.params.listingId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/updateAttractionTicketStatus/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const statusEnum = AttractionTicketStatusEnum[status as keyof typeof AttractionTicketStatusEnum];

    if (!statusEnum) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    const ticket = await AttractionTicketService.updateAttractionTicketStatus(req.params.id, statusEnum);
    res.status(200).json(ticket);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
