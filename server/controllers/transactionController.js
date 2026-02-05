import Income from "../models/incomeModel.js";
import Expense from "../models/expenseModel.js";

export const getAllTransactions = async (req, res) => {
  try {
    const userId = req.user._id;

    const incomes = await Income.find({ user: userId }).lean();
    const expenses = await Expense.find({ user: userId }).lean();

    const incomeTx = incomes.map(i => ({
      _id: i._id,
      title: i.title,
      amount: i.amount,
      date: i.date,
      category: i.category,
      type: "income"
    }));

    const expenseTx = expenses.map(e => ({
      _id: e._id,
      title: e.title,
      amount: e.amount,
      date: e.date,
      category: e.category,
      type: "expense"
    }));

    const allTransactions = [...incomeTx, ...expenseTx]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(allTransactions);

  } catch (error) {
    res.status(500).json({ message: "Failed to load transactions" });
  }
};