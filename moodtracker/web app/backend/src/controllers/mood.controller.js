 import PDFDocument from 'pdfkit';
import Mood from '../models/mood.model.js'; // Model import

// Create a new mood entry
export const createMood = async (req, res) => {
  try {
    const newMood = new Mood(req.body);
    const savedMood = await newMood.save();
    res.status(201).json(savedMood);
  } catch (error) {
    console.error('Create Mood Error:', error);
    res.status(500).json({ message: 'Failed to create mood' });
  }
};

// Get all mood entries for a user
export const getUserMoods = async (req, res) => {
  try {
    const { userId } = req.params;
    const moods = await Mood.find({ userId }).sort({ date: -1 });
    res.status(200).json(moods);
  } catch (error) {
    console.error('Get User Moods Error:', error);
    res.status(500).json({ message: 'Failed to fetch moods' });
  }
};

// Update a mood entry
export const updateMood = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMood = await Mood.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedMood);
  } catch (error) {
    console.error('Update Mood Error:', error);
    res.status(500).json({ message: 'Failed to update mood' });
  }
};

// Delete a mood entry
export const deleteMood = async (req, res) => {
  try {
    const { id } = req.params;
    await Mood.findByIdAndDelete(id);
    res.status(200).json({ message: 'Mood deleted' });
  } catch (error) {
    console.error('Delete Mood Error:', error);
    res.status(500).json({ message: 'Failed to delete mood' });
  }
};

// Get mood statistics
export const getMoodStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const moods = await Mood.find({ userId });
    // Example: simple count per mood type
    const stats = moods.reduce((acc, m) => {
      acc[m.mood] = (acc[m.mood] || 0) + 1;
      return acc;
    }, {});
    res.status(200).json(stats);
  } catch (error) {
    console.error('Mood Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// ===== Export LAST 7 DAYS MOOD HISTORY AS PDF =====
export const exportWeeklyMoodPDF = async (req, res) => {
  try {
    const { userId } = req.params;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const moods = await Mood.find({
      userId,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: -1 });

    const doc = new PDFDocument({ size: 'A4', margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="mood-last-7-days.pdf"'
    );

    doc.pipe(res);

    doc
      .fontSize(20)
      .text('Mood Report (Last 7 Days)', { align: 'center' })
      .moveDown(1.5);

    if (moods.length === 0) {
      doc.fontSize(12).text('No mood entries found for the last 7 days.');
      doc.end();
      return;
    }

    moods.forEach((entry, index) => {
      doc
        .fontSize(12)
        .text(`Date: ${new Date(entry.date).toLocaleString()}`)
        .text(`Mood: ${entry.mood}`)
        .text(`Intensity: ${entry.intensity ?? 'N/A'}`)
        .text(`Notes: ${entry.notes || '-'}`)
        .moveDown();

      if (index !== moods.length - 1) {
        doc
          .moveTo(40, doc.y)
          .lineTo(555, doc.y)
          .stroke()
          .moveDown();
      }
    });

    doc.end();
  } catch (error) {
    console.error('Weekly PDF Error:', error);
    res.status(500).json({ message: 'Failed to generate weekly PDF' });
  }
};
