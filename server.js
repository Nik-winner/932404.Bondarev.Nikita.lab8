const express = require('express');
const { engine } = require('express-handlebars');
const { Op } = require('sequelize');
const { sequelize, Ad } = require('./models');
const adRoutes = require('./routes/adRoutes');

const app = express();
const PORT = 3000;

app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: {
        eq: (a, b) => a === b,
        categoryName: (cat) => {
            const names = {
                electronics: 'Электроника',
                transport: 'Транспорт',
                books: 'Книги',
                hobby: 'Хобби',
                other: 'Другое'
            };
            return names[cat] || cat;
        },
        statusName: (s) => {
            const names = { active: 'Активно', sold: 'Продано', archived: 'Архив' };
            return names[s] || s;
        },
        formatDate: (date) => {
            if (!date) return '';
            return new Date(date).toLocaleDateString('ru-RU', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/ads/:id', async (req, res) => {
    try {
        const ad = await Ad.findByPk(req.params.id);
        if (!ad) return res.status(404).json({ error: 'Не найдено' });
        res.json(ad.get({ plain: true }));
    } catch (err) {
        console.error('GET /ads/:id error:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.use('/', adRoutes);

app.use((req, res) => {
    res.status(404).render('error', { title: '404', message: 'Страница не найдена' });
});

sequelize.sync()
    .then(() => {
        console.log('БД синхронизирована');
        app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
    })
    .catch(err => console.error('Ошибка БД:', err));