const InspectionRound = require('../models/inspectionRound');
const Manager = require('../models/manager');

exports.create = async (req, res) => {
  try {
    const { managerId, ...roundData } = req.body;

    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'المدير غير موجود' });
    }

    roundData.managerName = manager.name;
    roundData.managerRank = manager.rank;
    roundData.managerDepartment = manager.department;

    const round = new InspectionRound(roundData);
    await round.save();

    await Manager.findByIdAndUpdate(managerId, { $push: { lastRounds: round._id } });

    res.status(201).json(round);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

exports.list = async (req, res) => {
  try {
    const rounds = await InspectionRound.find();
    res.json(rounds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

exports.getById = async (req, res) => {
  try {
    const round = await InspectionRound.findById(req.params.id);
    if (!round) {
      return res.status(404).json({ message: 'جولة التفتيش غير موجودة' });
    }
    res.json(round);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};