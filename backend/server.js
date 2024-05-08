const express = require('express');
const userRoutes = require('./routes/userRoutes');
const scoreRoutes = require('./routes/scoreRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/scores', scoreRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
