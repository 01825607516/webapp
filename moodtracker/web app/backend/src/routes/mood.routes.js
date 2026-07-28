import { Router } from 'express';
import {
  createMood,
  getUserMoods,
  updateMood,
  deleteMood,
  getMoodStats,
  exportWeeklyMoodPDF,
} from '../controllers/mood.controller.js';

const router = Router();

router.post('/', createMood);
router.get('/user/:userId', getUserMoods);
router.get('/stats/:userId', getMoodStats);
router.get('/pdf/week/:userId', exportWeeklyMoodPDF);
router.put('/:id', updateMood);
router.delete('/:id', deleteMood);

export default router;
