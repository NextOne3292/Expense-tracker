import Income from "../models/incomeModel.js";
import Expense from "../models/expenseModel.js";

export const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type } = req.query;

    let incomeData = [];
    let expenseData = [];

    if (!type || type === "income") {
      incomeData = await Income.find({ user: userId })
        .populate("category", "title color")
        .lean();
    }

    if (!type || type === "expense") {
      expenseData = await Expense.find({ user: userId })
        .populate("category", "title color")
        .lean();
    }

    const incomeTx = incomeData.map(i => ({
      _id: i._id,
      title: i.title,
      amount: i.amount,
      date: i.date,
      category: i.category,
      note: i.note,          // ✅ FIX
      type: "income"
    }));

    const expenseTx = expenseData.map(e => ({
      _id: e._id,
      title: e.title,
      amount: e.amount,
      date: e.date,
      category: e.category,
      note: e.note,          // ✅ FIX
      type: "expense"
    }));

    const allTransactions = [...incomeTx, ...expenseTx].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.status(200).json(allTransactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load transactions" });
  }
};