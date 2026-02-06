import Category from "../models/categoryModel.js";
import mongoose from "mongoose";

/* CREATE */
export const createCategory = async (req, res) => {
  try {
    const { title, type, icon = "", color = "" } = req.body;

    if (!title || !type)
      return res.status(400).json({ message: "Title and type required" });

    const normalized = title.trim();

    const existing = await Category.findOne({
      title: normalized,
      type,
      user: req.user._id
    });

    if (existing)
      return res.status(409).json({ message: "Category already exists" });

    const category = await Category.create({
      title: normalized,
      type,
      icon,
      color,
      user: req.user._id,
      isDefault: false
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET ALL (supports type filter) */
export const getCategories = async (req, res) => {
  try {
    const filter = {
      $or: [{ user: null }, { user: req.user._id }]
    };

    if (req.query.type) {
      filter.type = req.query.type;
    }

    const categories = await Category.find(filter)
      .sort({ title: 1 })
      .lean();

    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* UPDATE */
export const updateCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });

    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    if (cat.isDefault)
      return res.status(403).json({ message: "Default categories cannot be modified" });

    if (String(cat.user) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    const update = { ...req.body };
    if (update.title) update.title = update.title.trim();

    const updated = await Category.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true
    });

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE */
export const deleteCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id" });

    const cat = await Category.findById(id);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    if (cat.isDefault)
      return res.status(403).json({ message: "Default categories cannot be deleted" });

    if (String(cat.user) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};