const express = require('express');
const router = express.Router();

// Helper to build base URL
function apiUrl(req, path) {
  return `${req.protocol}://${req.get('host')}${path}`;
}

router.get('/', (req, res) => {
  res.redirect('/managers');
});

// List managers
router.get('/managers', async (req, res) => {
  try {
    const resp = await fetch(apiUrl(req, '/api/managers'));
    const managers = await resp.json();

    let summary = null;
    if (req.query.id) {
      const s = await fetch(apiUrl(req, `/api/managers/${req.query.id}/summary`));
      if (s.ok) {
        summary = await s.json();
      }
    }

    res.render('managers/index', { title: 'المديرين', managers, summary });
  } catch (err) {
    console.error(err);
    res.render('managers/index', { title: 'المديرين', managers: [], summary: null });
  }
});

// Show create form
router.get('/managers/new', (req, res) => {
  res.render('managers/new', { title: 'إضافة مدير' });
});

// Handle create
router.post('/managers', async (req, res) => {
  try {
    await fetch(apiUrl(req, '/api/managers'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.redirect('/managers');
  } catch (err) {
    console.error(err);
    res.render('managers/new', { title: 'إضافة مدير' });
  }
});

// Update manager via form on main page
router.post('/managers/update', async (req, res) => {
  try {
    const { id, name, rank, department } = req.body;
    await fetch(apiUrl(req, `/api/managers/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rank, department })
    });
    res.redirect('/managers');
  } catch (err) {
    console.error(err);
    res.redirect('/managers');
  }
});

// Edit form
router.get('/managers/:id/edit', async (req, res) => {
  try {
    const resp = await fetch(apiUrl(req, `/api/managers/${req.params.id}`));
    const manager = await resp.json();
    res.render('managers/edit', { title: 'تعديل مدير', manager });
  } catch (err) {
    console.error(err);
    res.redirect('/managers');
  }
});

// Update manager
router.post('/managers/:id', async (req, res) => {
  try {
    await fetch(apiUrl(req, `/api/managers/${req.params.id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.redirect('/managers');
  } catch (err) {
    console.error(err);
    res.redirect('/managers');
  }
});

module.exports = router;
