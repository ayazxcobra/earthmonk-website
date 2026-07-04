// routes/menu.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public: full menu, grouped by category, in display order.
router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM menu_categories ORDER BY sort_order').all();
  const items = db.prepare('SELECT * FROM menu_items ORDER BY sort_order').all();

  const grouped = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    items: items
      .filter((item) => item.category_id === cat.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        veg: !!item.veg,
        popular: !!item.popular,
      })),
  }));

  res.json(grouped);
});

const itemValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).escape(),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 300 }).escape(),
  body('price').isInt({ min: 0, max: 100000 }),
  body('veg').isBoolean(),
  body('popular').isBoolean(),
];

// Admin only: update an existing menu item (e.g. change price).
router.put('/items/:id', requireAdmin, itemValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  const { name, description, price, veg, popular } = req.body;
  const result = db.prepare(`
    UPDATE menu_items SET name = ?, description = ?, price = ?, veg = ?, popular = ?
    WHERE id = ?
  `).run(name, description || '', price, veg ? 1 : 0, popular ? 1 : 0, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }
  res.json({ message: 'Menu item updated.' });
});

// Admin only: add a new menu item to a category.
router.post('/items', requireAdmin, [...itemValidation, body('category_id').isInt()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  const { category_id, name, description, price, veg, popular } = req.body;
  const result = db.prepare(`
    INSERT INTO menu_items (category_id, name, description, price, veg, popular, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, 999)
  `).run(category_id, name, description || '', price, veg ? 1 : 0, popular ? 1 : 0);

  res.status(201).json({ message: 'Menu item added.', id: result.lastInsertRowid });
});

// Admin only: remove a menu item.
router.delete('/items/:id', requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }
  res.json({ message: 'Menu item deleted.' });
});

module.exports = router;
