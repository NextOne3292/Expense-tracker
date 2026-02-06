import Expense from "../models/expenseModel.js";
import Category from "../models/categoryModel.js";
import mongoose from "mongoose";

/* ---------- Helpers ---------- */
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

/* CREATE EXPENSE */
export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date = Date.now(), note = "" } = req.body;

    if (!title || !amount || !category)
      return res.status(400).json({ message: "All fields required" });

    if (!isValidObjectId(category))
      return res.status(400).json({ message: "Invalid category id" });

    const cat = await Category.findById(category);
    if (!cat) return res.status(400).json({ message: "Category not found" });

    if (cat.user && String(cat.user) !== String(req.user._id))
      return res.status(400).json({ message: "Category does not belong to user" });

    if (cat.type !== "expense")
      return res.status(400).json({ message: "Choose an expense category" });

    const expense = await Expense.create({
      title: title.trim(),
      amount,
      category,
      user: req.user._id,
      date,
      note: note.trim()
    });

    const populated = await Expense.findById(expense._id)
      .populate("category", "title icon color type");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET EXPENSES (supports limit) */
export const getExpenses = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 0;

    const expenses = await Expense.find({ user: req.user._id })
      .populate("category", "title icon color type")
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET EXPENSE BY ID */
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const expense = await Expense.findById(id)
      .populate("category", "title icon color type");

    if (!expense)
      return res.status(404).json({ message: "Expense not found" });

    if (String(expense.user) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE EXPENSE */
export const updateExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const expense = await Expense.findById(id);
    if (!expense)
      return res.status(404).json({ message: "Expense not found" });

    if (String(expense.user) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    if (req.body.category) {
      if (!isValidObjectId(req.body.category))
        return res.status(400).json({ message: "Invalid category id" });

      const cat = await Category.findById(req.body.category);
      if (!cat || cat.type !== "expense")
        return res.status(400).json({ message: "Invalid expense category" });
    }

    const updated = await Expense.findByIdAndUpdate(
      id,
      {
        ...req.body,
        title: req.body.title?.trim(),
        note: req.body.note?.trim()
      },
      { new: true, runValidators: true }
    ).populate("category", "title icon color type");

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE EXPENSE */
export const deleteExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const expense = await Expense.findById(id);
    if (!expense)
      return res.status(404).json({ message: "Expense not found" });

    if (String(expense.user) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    await Expense.findByIdAndDelete(id);
    res.status(200).json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};