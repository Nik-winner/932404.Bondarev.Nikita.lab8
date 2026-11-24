const { Ad } = require('../models');
const { Op } = require('sequelize');

const VALID_CATEGORIES = ['electronics', 'transport', 'books', 'hobby', 'other'];
const VALID_STATUSES = ['active', 'sold', 'archived'];

const toPlain = (items) => {
    if (Array.isArray(items)) {
        return items.map(item => item.get({ plain: true }));
    }
    return items ? items.get({ plain: true }) : null;
};

exports.getIndex = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, status } = req.query;

        const where = {};

        if (category && VALID_CATEGORIES.includes(category)) {
            where.category = category;
        }

        if (status && VALID_STATUSES.includes(status)) {
            where.status = status;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined && !isNaN(parseFloat(minPrice))) {
                where.price[require('sequelize').Op.gte] = parseFloat(minPrice);
            }
            if (maxPrice !== undefined && !isNaN(parseFloat(maxPrice))) {
                where.price[require('sequelize').Op.lte] = parseFloat(maxPrice);
            }
        }

        if (search && search.trim()) {
            where.title = { [require('sequelize').Op.like]: `%${search.trim()}%` };
        }

        const ads = await Ad.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

        const plainAds = ads.map(ad => ad.get({ plain: true }));

        res.render('index', {
            title: 'Доска объявлений',
            ads: toPlain(ads),
            filters: { category, minPrice, maxPrice, search, status },
            categories: VALID_CATEGORIES,
            statuses: VALID_STATUSES,
            adsCount: ads.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { title: 'Ошибка', message: 'Ошибка сервера' });
    }
};

exports.getCreate = (req, res) => {
    res.render('create', {
        title: 'Новое объявление',
        categories: VALID_CATEGORIES,
        errors: []
    });
};

exports.create = async (req, res) => {
    try {
        const { title, description, price, category } = req.body;
        const errors = [];

        if (!title || title.trim().length < 3) errors.push('Заголовок должен содержать минимум 3 символа');
        if (!description || !description.trim()) errors.push('Описание обязательно');
        if (price === undefined || price === '' || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
            errors.push('Цена должна быть неотрицательным числом');
        }
        if (!category || !VALID_CATEGORIES.includes(category)) errors.push('Неверная категория');

        if (errors.length > 0) {
            return res.status(400).render('create', {
                title: 'Новое объявление',
                categories: VALID_CATEGORIES,
                errors,
                form: { title, description, price, category }
            });
        }

        await Ad.create({
            title: title.trim(),
            description: description.trim(),
            price: parseFloat(price),
            category
        });

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { title: 'Ошибка', message: 'Ошибка сервера' });
    }
};

exports.update = async (req, res) => {
    try {
        const ad = await Ad.findByPk(req.params.id);
        if (!ad) return res.status(404).json({ error: 'Объявление не найдено' });

        const { title, description, price, category, status } = req.body;
        const errors = [];

        if (title && title.trim().length < 3) errors.push('Заголовок минимум 3 символа');
        if (price !== undefined && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
            errors.push('Цена должна быть неотрицательным числом');
        }
        if (category && !VALID_CATEGORIES.includes(category)) errors.push('Неверная категория');
        if (status && !VALID_STATUSES.includes(status)) errors.push('Неверный статус');

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (price !== undefined) updateData.price = parseFloat(price);
        if (category !== undefined) updateData.category = category;
        if (status !== undefined) updateData.status = status;

        await ad.update(updateData);
        res.json({ success: true, ad: ad.get({ plain: true }) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

exports.delete = async (req, res) => {
    try {
        const ad = await Ad.findByPk(req.params.id);
        if (!ad) return res.status(404).json({ error: 'Объявление не найдено' });

        await ad.destroy();
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};